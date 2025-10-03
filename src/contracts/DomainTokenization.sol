// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DomainTokenization
 * @dev Smart contract for tokenizing domain names as NFTs
 * Implements Use Case 8.1.1: Tokenization and Liquidity Access
 */
contract DomainTokenization is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Domain information structure
    struct DomainInfo {
        string domainName;
        uint256 valuation;
        uint256 confidence;
        string category;
        bool isListed;
        uint256 listPrice;
        address fractionalVault;
        uint256 royaltyPercentage;
        uint256 createdAt;
    }
    
    // Mapping from token ID to domain info
    mapping(uint256 => DomainInfo) public domains;
    
    // Mapping from domain name to token ID
    mapping(string => uint256) public domainToTokenId;
    
    // Events
    event DomainTokenized(
        uint256 indexed tokenId,
        string domainName,
        uint256 valuation,
        address indexed owner
    );
    
    event DomainListed(
        uint256 indexed tokenId,
        uint256 price,
        address indexed owner
    );
    
    event DomainSold(
        uint256 indexed tokenId,
        uint256 price,
        address indexed buyer,
        address indexed seller
    );
    
    event FractionalVaultCreated(
        uint256 indexed tokenId,
        address indexed vaultAddress
    );
    
    constructor() ERC721("DomaLand Domain", "DOMAIN") {}
    
    /**
     * @dev Tokenize a domain name as an NFT
     * @param domainName The domain name to tokenize
     * @param valuation AI-generated valuation in USD (scaled by 1e18)
     * @param confidence Confidence score (0-100)
     * @param category Domain category
     * @param metadataURI URI containing domain metadata
     * @param royaltyPercentage Royalty percentage for future sales (0-1000 = 0-100%)
     */
    function tokenizeDomain(
        string memory domainName,
        uint256 valuation,
        uint256 confidence,
        string memory category,
        string memory metadataURI,
        uint256 royaltyPercentage
    ) external nonReentrant returns (uint256) {
        require(bytes(domainName).length > 0, "Domain name cannot be empty");
        require(domainToTokenId[domainName] == 0, "Domain already tokenized");
        require(valuation > 0, "Valuation must be positive");
        require(confidence <= 100, "Confidence must be <= 100");
        require(royaltyPercentage <= 1000, "Royalty percentage too high");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Store domain information
        domains[tokenId] = DomainInfo({
            domainName: domainName,
            valuation: valuation,
            confidence: confidence,
            category: category,
            isListed: false,
            listPrice: 0,
            fractionalVault: address(0),
            royaltyPercentage: royaltyPercentage,
            createdAt: block.timestamp
        });
        
        domainToTokenId[domainName] = tokenId;
        
        // Mint NFT to caller
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit DomainTokenized(tokenId, domainName, valuation, msg.sender);
        
        return tokenId;
    }
    
    /**
     * @dev List a domain for sale
     * @param tokenId The token ID of the domain
     * @param price The asking price in wei
     */
    function listDomain(uint256 tokenId, uint256 price) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be positive");
        
        domains[tokenId].isListed = true;
        domains[tokenId].listPrice = price;
        
        emit DomainListed(tokenId, price, msg.sender);
    }
    
    /**
     * @dev Buy a listed domain
     * @param tokenId The token ID of the domain to buy
     */
    function buyDomain(uint256 tokenId) external payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(domains[tokenId].isListed, "Domain not listed");
        require(msg.value >= domains[tokenId].listPrice, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        uint256 price = domains[tokenId].listPrice;
        
        // Calculate royalty
        uint256 royalty = (price * domains[tokenId].royaltyPercentage) / 1000;
        uint256 sellerAmount = price - royalty;
        
        // Transfer ownership
        _transfer(seller, msg.sender, tokenId);
        
        // Update listing status
        domains[tokenId].isListed = false;
        domains[tokenId].listPrice = 0;
        
        // Transfer payments
        if (royalty > 0) {
            payable(owner()).transfer(royalty);
        }
        payable(seller).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit DomainSold(tokenId, price, msg.sender, seller);
    }
    
    /**
     * @dev Create a fractional ownership vault for a domain
     * @param tokenId The token ID of the domain
     * @param vaultAddress The address of the deployed fractional vault
     */
    function setFractionalVault(uint256 tokenId, address vaultAddress) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(vaultAddress != address(0), "Invalid vault address");
        
        domains[tokenId].fractionalVault = vaultAddress;
        
        emit FractionalVaultCreated(tokenId, vaultAddress);
    }
    
    /**
     * @dev Get domain information
     * @param tokenId The token ID
     * @return DomainInfo struct containing all domain data
     */
    function getDomainInfo(uint256 tokenId) external view returns (DomainInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return domains[tokenId];
    }
    
    /**
     * @dev Check if a domain is tokenized
     * @param domainName The domain name to check
     * @return bool True if tokenized, false otherwise
     */
    function isDomainTokenized(string memory domainName) external view returns (bool) {
        return domainToTokenId[domainName] != 0;
    }
    
    /**
     * @dev Get token ID for a domain name
     * @param domainName The domain name
     * @return uint256 The token ID (0 if not tokenized)
     */
    function getTokenId(string memory domainName) external view returns (uint256) {
        return domainToTokenId[domainName];
    }
    
    // Override required by Solidity
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
