// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title OfferFactory
 * @dev Contract for managing offers on domain NFTs
 * @author DomaLand Team
 */
contract OfferFactory is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct Offer {
        uint256 offerId;
        address nftContract;
        uint256 tokenId;
        address buyer;
        address tokenAddress;
        uint256 amount;
        uint256 expiresAt;
        bool isActive;
    }

    // State variables
    uint256 public nextOfferId = 1;
    uint256 public constant OFFER_TIMEOUT = 7 days;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    
    address public feeRecipient;
    address public usdcToken; // Default payment token
    
    mapping(uint256 => Offer) public offers;
    mapping(address => mapping(uint256 => uint256[])) public tokenOffers; // nftContract => tokenId => offerIds
    
    // Events
    event OfferMade(
        uint256 indexed offerId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        address tokenAddress,
        uint256 amount,
        uint256 expiresAt
    );
    
    event OfferAccepted(
        uint256 indexed offerId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 amount
    );
    
    event OfferWithdrawn(
        uint256 indexed offerId,
        address indexed buyer,
        uint256 amount
    );
    
    event OfferExpired(
        uint256 indexed offerId,
        address indexed buyer,
        uint256 amount
    );

    constructor(
        address _feeRecipient,
        address _usdcToken
    ) {
        feeRecipient = _feeRecipient;
        usdcToken = _usdcToken;
    }

    /**
     * @dev Make an offer on a domain NFT
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID of the domain
     * @param _amount Offer amount in payment token
     * @param _tokenAddress Address of the payment token (0x0 for ETH)
     */
    function makeOffer(
        address _nftContract,
        uint256 _tokenId,
        uint256 _amount,
        address _tokenAddress
    ) external payable whenNotPaused nonReentrant {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_amount > 0, "Offer amount must be greater than 0");
        require(_tokenAddress != address(0), "Invalid token address");
        
        // Check if NFT exists
        require(IERC721(_nftContract).ownerOf(_tokenId) != address(0), "NFT does not exist");
        
        // Transfer payment token from buyer to contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);
        
        // Create offer
        uint256 offerId = nextOfferId++;
        uint256 expiresAt = block.timestamp + OFFER_TIMEOUT;
        
        offers[offerId] = Offer({
            offerId: offerId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            buyer: msg.sender,
            tokenAddress: _tokenAddress,
            amount: _amount,
            expiresAt: expiresAt,
            isActive: true
        });
        
        tokenOffers[_nftContract][_tokenId].push(offerId);
        
        emit OfferMade(
            offerId,
            _nftContract,
            _tokenId,
            msg.sender,
            _tokenAddress,
            _amount,
            expiresAt
        );
    }

    /**
     * @dev Accept an offer (only NFT owner)
     * @param _offerId ID of the offer to accept
     */
    function acceptOffer(uint256 _offerId) external whenNotPaused nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(block.timestamp <= offer.expiresAt, "Offer has expired");
        
        // Check if caller is the NFT owner
        address nftOwner = IERC721(offer.nftContract).ownerOf(offer.tokenId);
        require(msg.sender == nftOwner, "Only NFT owner can accept offer");
        
        // Mark offer as inactive
        offer.isActive = false;
        
        // Calculate platform fee
        uint256 platformFee = (offer.amount * PLATFORM_FEE_BPS) / 10000;
        uint256 sellerAmount = offer.amount - platformFee;
        
        // Transfer payment token to seller
        IERC20(offer.tokenAddress).safeTransfer(nftOwner, sellerAmount);
        
        // Transfer platform fee
        if (platformFee > 0) {
            IERC20(offer.tokenAddress).safeTransfer(feeRecipient, platformFee);
        }
        
        // Transfer NFT to buyer
        IERC721(offer.nftContract).transferFrom(nftOwner, offer.buyer, offer.tokenId);
        
        emit OfferAccepted(
            _offerId,
            offer.nftContract,
            offer.tokenId,
            offer.buyer,
            nftOwner,
            offer.amount
        );
    }

    /**
     * @dev Withdraw an offer (only offer creator)
     * @param _offerId ID of the offer to withdraw
     */
    function withdrawOffer(uint256 _offerId) external whenNotPaused nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(msg.sender == offer.buyer, "Only offer creator can withdraw");
        require(block.timestamp > offer.expiresAt, "Offer has not expired yet");
        
        // Mark offer as inactive
        offer.isActive = false;
        
        // Return payment token to buyer
        IERC20(offer.tokenAddress).safeTransfer(offer.buyer, offer.amount);
        
        emit OfferWithdrawn(_offerId, offer.buyer, offer.amount);
    }

    /**
     * @dev Get all active offers for a specific NFT
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID of the domain
     * @return Array of offer IDs
     */
    function getOffersForToken(
        address _nftContract,
        uint256 _tokenId
    ) external view returns (uint256[] memory) {
        return tokenOffers[_nftContract][_tokenId];
    }

    /**
     * @dev Get offer details
     * @param _offerId ID of the offer
     * @return Offer struct
     */
    function getOffer(uint256 _offerId) external view returns (Offer memory) {
        return offers[_offerId];
    }

    /**
     * @dev Check if an offer is active and not expired
     * @param _offerId ID of the offer
     * @return True if offer is active and not expired
     */
    function isOfferValid(uint256 _offerId) external view returns (bool) {
        Offer memory offer = offers[_offerId];
        return offer.isActive && block.timestamp <= offer.expiresAt;
    }

    /**
     * @dev Emergency function to pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Emergency function to unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Update fee recipient
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Update USDC token address
     * @param _usdcToken New USDC token address
     */
    function setUsdcToken(address _usdcToken) external onlyOwner {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdcToken = _usdcToken;
    }

    /**
     * @dev Emergency function to recover stuck tokens
     * @param _token Address of the token to recover
     * @param _amount Amount to recover
     */
    function emergencyRecover(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}

