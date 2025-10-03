// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title DomainTokenization
 * @dev Advanced domain tokenization contract supporting ERC-721 and ERC-1155 standards
 * Implements EIP-2981 for royalty distribution and verification oracles
 */
contract DomainTokenization is ERC721, ERC1155, IERC2981, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Domain structure with comprehensive metadata
    struct DomainInfo {
        string name;
        string sld; // Second Level Domain
        string tld; // Top Level Domain
        uint256 estimatedValue;
        string ipfsHash; // IPFS hash for metadata storage
        bool isVerified;
        bool isListed;
        uint256 listingPrice;
        bool isFractionalized;
        address fractionalContract;
        uint256 totalShares;
        uint256 sharePrice;
        uint256 expirationDate;
        string proofOfContactsHandle;
        uint256 voucherNonce;
    }
    
    // Mapping from token ID to domain info
    mapping(uint256 => DomainInfo) public domains;
    
    // Mapping from domain name to token ID
    mapping(string => uint256) public domainToTokenId;
    
    // Mapping from token ID to royalty info
    mapping(uint256 => RoyaltyInfo) private _royalties;
    
    // Royalty structure
    struct RoyaltyInfo {
        address recipient;
        uint256 amount; // Basis points (e.g., 500 = 5%)
    }
    
    // Verification oracle addresses
    mapping(address => bool) public verificationOracles;
    
    // Events
    event DomainTokenized(
        uint256 indexed tokenId,
        string indexed domainName,
        address indexed owner,
        string ipfsHash,
        uint256 estimatedValue
    );
    
    event DomainVerified(uint256 indexed tokenId, bool verified);
    event DomainListed(uint256 indexed tokenId, uint256 price);
    event DomainUnlisted(uint256 indexed tokenId);
    event DomainFractionalized(uint256 indexed tokenId, address fractionalContract, uint256 totalShares);
    event RoyaltySet(uint256 indexed tokenId, address recipient, uint256 amount);
    
    // Modifiers
    modifier onlyVerificationOracle() {
        require(verificationOracles[msg.sender], "Only verification oracle can call this function");
        _;
    }
    
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }
    
    constructor() ERC721("DomaLand Domains", "DOMAIN") ERC1155("") {
        // Set default royalty recipient to contract owner
        _setDefaultRoyalty(owner(), 500); // 5% default royalty
    }
    
    /**
     * @dev Tokenize a domain as ERC-721 NFT
     * @param domainName The full domain name
     * @param sld Second level domain
     * @param tld Top level domain
     * @param estimatedValue AI-calculated estimated value
     * @param ipfsHash IPFS hash containing domain metadata
     * @param recipient Address to receive the token
     */
    function tokenizeDomain(
        string memory domainName,
        string memory sld,
        string memory tld,
        uint256 estimatedValue,
        string memory ipfsHash,
        address recipient
    ) external onlyOwner nonReentrant returns (uint256) {
        require(domainToTokenId[domainName] == 0, "Domain already tokenized");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(estimatedValue > 0, "Estimated value must be greater than 0");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Create domain info
        domains[newTokenId] = DomainInfo({
            name: domainName,
            sld: sld,
            tld: tld,
            estimatedValue: estimatedValue,
            ipfsHash: ipfsHash,
            isVerified: false,
            isListed: false,
            listingPrice: 0,
            isFractionalized: false,
            fractionalContract: address(0),
            totalShares: 0,
            sharePrice: 0,
            expirationDate: 0,
            proofOfContactsHandle: "",
            voucherNonce: 0
        });
        
        domainToTokenId[domainName] = newTokenId;
        
        // Mint ERC-721 token
        _mint(recipient, newTokenId);
        
        // Set default royalty for this token
        _setTokenRoyalty(newTokenId, recipient, 500); // 5% royalty
        
        emit DomainTokenized(newTokenId, domainName, recipient, ipfsHash, estimatedValue);
        
        return newTokenId;
    }
    
    /**
     * @dev Verify domain ownership through oracle
     * @param tokenId The token ID to verify
     * @param verified Whether the domain is verified
     * @param proofOfContactsHandle Proof of contacts handle
     */
    function verifyDomain(
        uint256 tokenId,
        bool verified,
        string memory proofOfContactsHandle
    ) external onlyVerificationOracle tokenExists(tokenId) {
        domains[tokenId].isVerified = verified;
        domains[tokenId].proofOfContactsHandle = proofOfContactsHandle;
        
        emit DomainVerified(tokenId, verified);
    }
    
    /**
     * @dev List domain for sale
     * @param tokenId The token ID to list
     * @param price The listing price
     */
    function listDomain(uint256 tokenId, uint256 price) external tokenExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this domain");
        require(price > 0, "Price must be greater than 0");
        require(domains[tokenId].isVerified, "Domain must be verified before listing");
        
        domains[tokenId].isListed = true;
        domains[tokenId].listingPrice = price;
        
        emit DomainListed(tokenId, price);
    }
    
    /**
     * @dev Unlist domain from sale
     * @param tokenId The token ID to unlist
     */
    function unlistDomain(uint256 tokenId) external tokenExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this domain");
        
        domains[tokenId].isListed = false;
        domains[tokenId].listingPrice = 0;
        
        emit DomainUnlisted(tokenId);
    }
    
    /**
     * @dev Purchase a listed domain
     * @param tokenId The token ID to purchase
     */
    function purchaseDomain(uint256 tokenId) external payable tokenExists(tokenId) nonReentrant {
        require(domains[tokenId].isListed, "Domain is not listed");
        require(msg.value >= domains[tokenId].listingPrice, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot purchase your own domain");
        
        address previousOwner = ownerOf(tokenId);
        uint256 purchasePrice = domains[tokenId].listingPrice;
        
        // Calculate royalty
        (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, purchasePrice);
        uint256 royaltyFee = (purchasePrice * royaltyAmount) / 10000;
        uint256 sellerAmount = purchasePrice - royaltyFee;
        
        // Transfer token
        _transfer(previousOwner, msg.sender, tokenId);
        
        // Update domain status
        domains[tokenId].isListed = false;
        domains[tokenId].listingPrice = 0;
        
        // Transfer payments
        if (royaltyFee > 0) {
            payable(royaltyRecipient).transfer(royaltyFee);
        }
        payable(previousOwner).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > purchasePrice) {
            payable(msg.sender).transfer(msg.value - purchasePrice);
        }
    }
    
    /**
     * @dev Mark domain as fractionalized
     * @param tokenId The token ID
     * @param fractionalContract Address of the fractional ownership contract
     * @param totalShares Total number of shares
     * @param sharePrice Price per share
     */
    function markAsFractionalized(
        uint256 tokenId,
        address fractionalContract,
        uint256 totalShares,
        uint256 sharePrice
    ) external onlyOwner tokenExists(tokenId) {
        domains[tokenId].isFractionalized = true;
        domains[tokenId].fractionalContract = fractionalContract;
        domains[tokenId].totalShares = totalShares;
        domains[tokenId].sharePrice = sharePrice;
        
        emit DomainFractionalized(tokenId, fractionalContract, totalShares);
    }
    
    /**
     * @dev Set royalty information for a specific token
     * @param tokenId The token ID
     * @param recipient Address to receive royalties
     * @param amount Royalty amount in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address recipient,
        uint256 amount
    ) external tokenExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this domain");
        require(amount <= 1000, "Royalty cannot exceed 10%");
        
        _setTokenRoyalty(tokenId, recipient, amount);
        
        emit RoyaltySet(tokenId, recipient, amount);
    }
    
    /**
     * @dev Add or remove verification oracle
     * @param oracle Address of the oracle
     * @param isOracle Whether the address is an oracle
     */
    function setVerificationOracle(address oracle, bool isOracle) external onlyOwner {
        verificationOracles[oracle] = isOracle;
    }
    
    /**
     * @dev Get domain information
     * @param tokenId The token ID
     * @return DomainInfo struct
     */
    function getDomainInfo(uint256 tokenId) external view tokenExists(tokenId) returns (DomainInfo memory) {
        return domains[tokenId];
    }
    
    /**
     * @dev Get token ID by domain name
     * @param domainName The domain name
     * @return tokenId The token ID
     */
    function getTokenIdByDomain(string memory domainName) external view returns (uint256) {
        return domainToTokenId[domainName];
    }
    
    /**
     * @dev Check if domain is tokenized
     * @param domainName The domain name
     * @return bool Whether the domain is tokenized
     */
    function isDomainTokenized(string memory domainName) external view returns (bool) {
        return domainToTokenId[domainName] != 0;
    }
    
    // EIP-2981 Royalty Standard Implementation
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        public
        view
        override
        returns (address, uint256)
    {
        RoyaltyInfo memory royalty = _royalties[tokenId];
        
        if (royalty.recipient == address(0)) {
            royalty = RoyaltyInfo(owner(), 500); // Default 5% royalty
        }
        
        uint256 royaltyAmount = (salePrice * royalty.amount) / 10000;
        return (royalty.recipient, royaltyAmount);
    }
    
    function _setTokenRoyalty(uint256 tokenId, address recipient, uint256 amount) internal {
        require(amount <= 1000, "Royalty cannot exceed 10%");
        _royalties[tokenId] = RoyaltyInfo(recipient, amount);
    }
    
    function _setDefaultRoyalty(address recipient, uint256 amount) internal {
        require(amount <= 1000, "Royalty cannot exceed 10%");
        _royalties[0] = RoyaltyInfo(recipient, amount);
    }
    
    // Override supportsInterface to include EIP-2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC1155, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    // Override _exists to check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds.current();
    }
}
