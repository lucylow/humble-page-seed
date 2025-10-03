// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DomaLandOfferManager
 * @dev Manages offers for Doma domains with deep Doma protocol integration
 */
contract DomaLandOfferManager is ReentrancyGuard, Ownable {
    // ============ STRUCTS ============
    
    struct Offer {
        address buyer;
        address paymentToken;
        uint256 amount;
        uint256 expirationTime;
        bool fulfilled;
        bool canceled;
    }
    
    struct DomainInfo {
        address nftContract;
        uint256 tokenId;
        address domainOwner;
    }
    
    // ============ CONSTANTS ============
    
    // Doma Protocol Addresses (Testnet)
    address public constant DOMA_MARKETPLACE = 0x742d35Cc6634C0532925a3b844Bc454e4438f44e; // Doma Marketplace contract
    address public constant DOMA_REGISTRAR = 0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c;   // Doma Registrar controller
    address public constant USDC_TOKEN = 0xA0b86a33E6441b8dB2B2b0b0b0b0b0b0b0b0b0b0;       // USDC on Doma chain
    
    // ============ STORAGE ============
    
    // Offer ID => Offer details
    mapping(bytes32 => Offer) public offers;
    
    // Domain identifier => Offer IDs
    mapping(bytes32 => bytes32[]) public domainOffers;
    
    // Offer ID => Domain identifier
    mapping(bytes32 => bytes32) public offerToDomain;
    
    // Supported payment tokens
    mapping(address => bool) public supportedTokens;
    
    // Protocol fee basis points (0.5%)
    uint256 public protocolFeeBps = 50;
    
    // Protocol fee recipient
    address public feeRecipient;
    
    // ============ EVENTS ============
    
    event OfferCreated(
        bytes32 indexed offerId,
        bytes32 indexed domainId,
        address indexed buyer,
        address paymentToken,
        uint256 amount,
        uint256 expirationTime
    );
    
    event OfferAccepted(
        bytes32 indexed offerId,
        bytes32 indexed domainId,
        address indexed seller
    );
    
    event OfferCanceled(
        bytes32 indexed offerId,
        bytes32 indexed domainId,
        address indexed buyer
    );
    
    event PaymentTokenAdded(address token);
    event PaymentTokenRemoved(address token);
    event ProtocolFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);
    
    // ============ MODIFIERS ============
    
    modifier onlyDomainOwner(bytes32 domainId) {
        DomainInfo memory info = _parseDomainId(domainId);
        require(
            IERC721(info.nftContract).ownerOf(info.tokenId) == msg.sender,
            "Not domain owner"
        );
        _;
    }
    
    modifier offerExists(bytes32 offerId) {
        require(offers[offerId].buyer != address(0), "Offer does not exist");
        _;
    }
    
    modifier offerActive(bytes32 offerId) {
        require(offers[offerId].expirationTime > block.timestamp, "Offer expired");
        require(!offers[offerId].fulfilled, "Offer fulfilled");
        require(!offers[offerId].canceled, "Offer canceled");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        
        // Initialize supported tokens
        supportedTokens[USDC_TOKEN] = true;
        supportedTokens[address(0)] = true; // Native token
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Create an offer for a Doma domain
     * @param domainId Unique domain identifier (encoded nftContract + tokenId)
     * @param paymentToken Address of the payment token (address(0) for native)
     * @param amount Offer amount
     * @param duration Offer duration in seconds
     */
    function createOffer(
        bytes32 domainId,
        address paymentToken,
        uint256 amount,
        uint256 duration
    ) external payable nonReentrant {
        // Validate payment token
        require(supportedTokens[paymentToken], "Unsupported payment token");
        
        // Validate amount
        require(amount > 0, "Invalid amount");
        
        if (paymentToken == address(0)) {
            require(msg.value == amount, "Incorrect native token amount");
        } else {
            require(msg.value == 0, "Native token not required");
            // Transfer ERC20 tokens to this contract
            require(
                IERC20(paymentToken).transferFrom(msg.sender, address(this), amount),
                "Token transfer failed"
            );
        }
        
        // Verify domain exists and is valid
        DomainInfo memory info = _parseDomainId(domainId);
        require(
            IERC721(info.nftContract).ownerOf(info.tokenId) != address(0),
            "Domain does not exist"
        );
        
        // Verify domain is not currently listed on Doma marketplace
        require(
            !_isDomainListedOnDomaMarketplace(info.nftContract, info.tokenId),
            "Domain listed on Doma marketplace"
        );
        
        // Create offer
        bytes32 offerId = keccak256(
            abi.encodePacked(domainId, msg.sender, block.timestamp, amount)
        );
        
        offers[offerId] = Offer({
            buyer: msg.sender,
            paymentToken: paymentToken,
            amount: amount,
            expirationTime: block.timestamp + duration,
            fulfilled: false,
            canceled: false
        });
        
        domainOffers[domainId].push(offerId);
        offerToDomain[offerId] = domainId;
        
        emit OfferCreated(
            offerId,
            domainId,
            msg.sender,
            paymentToken,
            amount,
            block.timestamp + duration
        );
    }
    
    /**
     * @dev Accept an offer for a domain
     * @param offerId ID of the offer to accept
     */
    function acceptOffer(bytes32 offerId) 
        external 
        nonReentrant 
        offerExists(offerId) 
        offerActive(offerId) 
    {
        bytes32 domainId = offerToDomain[offerId];
        DomainInfo memory info = _parseDomainId(domainId);
        
        // Verify caller is domain owner
        require(
            IERC721(info.nftContract).ownerOf(info.tokenId) == msg.sender,
            "Not domain owner"
        );
        
        Offer storage offer = offers[offerId];
        
        // Calculate protocol fee
        uint256 protocolFee = (offer.amount * protocolFeeBps) / 10000;
        uint256 sellerAmount = offer.amount - protocolFee;
        
        // Mark offer as fulfilled
        offer.fulfilled = true;
        
        // Transfer payment
        if (offer.paymentToken == address(0)) {
            // Native token
            (bool success, ) = msg.sender.call{value: sellerAmount}("");
            require(success, "Native transfer failed");
            
            if (protocolFee > 0) {
                (success, ) = feeRecipient.call{value: protocolFee}("");
                require(success, "Fee transfer failed");
            }
        } else {
            // ERC20 token
            require(
                IERC20(offer.paymentToken).transfer(msg.sender, sellerAmount),
                "Token transfer to seller failed"
            );
            
            if (protocolFee > 0) {
                require(
                    IERC20(offer.paymentToken).transfer(feeRecipient, protocolFee),
                    "Fee transfer failed"
                );
            }
        }
        
        // Transfer domain ownership through Doma protocol
        _transferDomainThroughDoma(
            info.nftContract,
            info.tokenId,
            msg.sender,
            offer.buyer
        );
        
        emit OfferAccepted(offerId, domainId, msg.sender);
    }
    
    /**
     * @dev Cancel an active offer
     * @param offerId ID of the offer to cancel
     */
    function cancelOffer(bytes32 offerId) 
        external 
        nonReentrant 
        offerExists(offerId) 
        offerActive(offerId) 
    {
        require(offers[offerId].buyer == msg.sender, "Not offer creator");
        
        Offer storage offer = offers[offerId];
        offer.canceled = true;
        
        bytes32 domainId = offerToDomain[offerId];
        
        // Refund payment
        if (offer.paymentToken == address(0)) {
            (bool success, ) = msg.sender.call{value: offer.amount}("");
            require(success, "Refund failed");
        } else {
            require(
                IERC20(offer.paymentToken).transfer(msg.sender, offer.amount),
                "Refund failed"
            );
        }
        
        emit OfferCanceled(offerId, domainId, msg.sender);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function addPaymentToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit PaymentTokenAdded(token);
    }
    
    function removePaymentToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit PaymentTokenRemoved(token);
    }
    
    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee too high"); // Max 5%
        protocolFeeBps = newFeeBps;
        emit ProtocolFeeUpdated(newFeeBps);
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get all offers for a specific domain
     * @param domainId Domain identifier
     * @return Array of offer details
     */
    function getDomainOffers(bytes32 domainId) 
        external 
        view 
        returns (Offer[] memory) 
    {
        bytes32[] memory offerIds = domainOffers[domainId];
        Offer[] memory result = new Offer[](offerIds.length);
        
        for (uint256 i = 0; i < offerIds.length; i++) {
            result[i] = offers[offerIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Check if a domain is listed on Doma marketplace
     * @param domainId Domain identifier
     * @return True if listed, false otherwise
     */
    function isDomainListed(bytes32 domainId) external view returns (bool) {
        DomainInfo memory info = _parseDomainId(domainId);
        return _isDomainListedOnDomaMarketplace(info.nftContract, info.tokenId);
    }
    
    /**
     * @dev Generate domain ID from NFT contract and token ID
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return domainId Unique domain identifier
     */
    function generateDomainId(address nftContract, uint256 tokenId) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(nftContract, tokenId));
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Parse domain ID into its components
     * @param domainId Domain identifier
     * @return DomainInfo struct with parsed data
     */
    function _parseDomainId(bytes32 domainId) 
        internal 
        pure 
        returns (DomainInfo memory) 
    {
        return DomainInfo({
            nftContract: address(uint160(uint256(domainId) >> 96)),
            tokenId: uint256(domainId) & type(uint96).max,
            domainOwner: address(0)
        });
    }
    
    /**
     * @dev Check if domain is listed on Doma marketplace
     */
    function _isDomainListedOnDomaMarketplace(address nftContract, uint256 tokenId) 
        internal 
        view 
        returns (bool) 
    {
        // Interface for Doma Marketplace
        (bool success, bytes memory data) = DOMA_MARKETPLACE.staticcall(
            abi.encodeWithSignature(
                "getListing(address,uint256)",
                nftContract,
                tokenId
            )
        );
        
        if (!success) return false;
        
        // If listing exists, seller will not be address(0)
        (address seller, , , ) = abi.decode(data, (address, uint256, bool, uint256));
        return seller != address(0);
    }
    
    /**
     * @dev Transfer domain ownership through Doma protocol
     */
    function _transferDomainThroughDoma(
        address nftContract,
        uint256 tokenId,
        address from,
        address to
    ) internal {
        // Verify the sender approves this contract to transfer the NFT
        require(
            IERC721(nftContract).isApprovedForAll(from, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Contract not approved to transfer NFT"
        );
        
        // Perform the transfer through Doma's recommended method
        IERC721(nftContract).safeTransferFrom(from, to, tokenId);
        
        // Additional Doma-specific registration update if needed
        _updateDomaRegistration(nftContract, tokenId, to);
    }
    
    /**
     * @dev Update Doma registration records
     */
    function _updateDomaRegistration(
        address nftContract,
        uint256 tokenId,
        address newOwner
    ) internal {
        // Interface for Doma Registrar
        (bool success, ) = DOMA_REGISTRAR.call(
            abi.encodeWithSignature(
                "updateRegistration(address,uint256,address)",
                nftContract,
                tokenId,
                newOwner
            )
        );
        
        // This is optional - doesn't revert if call fails
        if (!success) {
            // Emit event but don't revert
            emit RegistrationUpdateFailed(nftContract, tokenId, newOwner);
        }
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {
        // Accept native token transfers
    }
    
    // ============ EVENTS ============
    
    event RegistrationUpdateFailed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address attemptedOwner
    );
}


