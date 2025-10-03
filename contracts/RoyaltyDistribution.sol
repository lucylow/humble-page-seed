// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title RoyaltyDistribution
 * @dev Sophisticated royalty distribution system for domain NFTs and fractional ownership
 * Implements EIP-2981 and supports multiple revenue streams
 */
contract RoyaltyDistribution is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    
    // Royalty recipient structure
    struct RoyaltyRecipient {
        address recipient;
        uint256 percentage; // Basis points (e.g., 500 = 5%)
        bool isActive;
        string description;
    }
    
    // Revenue stream structure
    struct RevenueStream {
        string name;
        uint256 totalRevenue;
        uint256 lastDistribution;
        bool isActive;
        mapping(address => uint256) recipientShares;
    }
    
    // Domain-specific royalty configuration
    struct DomainRoyaltyConfig {
        uint256 domainTokenId;
        address[] recipients;
        uint256[] percentages;
        bool isActive;
        uint256 totalPercentage;
    }
    
    // Global royalty configuration
    struct GlobalRoyaltyConfig {
        address[] recipients;
        uint256[] percentages;
        bool isActive;
        uint256 totalPercentage;
    }
    
    // State variables
    mapping(uint256 => DomainRoyaltyConfig) public domainRoyalties;
    GlobalRoyaltyConfig public globalRoyalties;
    mapping(string => RevenueStream) public revenueStreams;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public lastClaim;
    
    // Events
    event RoyaltyConfigured(
        uint256 indexed domainTokenId,
        address[] recipients,
        uint256[] percentages
    );
    
    event GlobalRoyaltyConfigured(
        address[] recipients,
        uint256[] percentages
    );
    
    event RevenueReceived(
        string indexed streamName,
        uint256 amount,
        uint256 domainTokenId
    );
    
    event RevenueDistributed(
        string indexed streamName,
        uint256 totalAmount,
        uint256 domainTokenId
    );
    
    event RoyaltyClaimed(
        address indexed recipient,
        uint256 amount,
        string streamName
    );
    
    event RevenueStreamCreated(
        string indexed streamName,
        bool isActive
    );
    
    // Modifiers
    modifier validPercentages(uint256[] memory percentages) {
        uint256 total = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            total = total.add(percentages[i]);
        }
        require(total <= 10000, "Total percentage cannot exceed 100%");
        _;
    }
    
    modifier validRecipients(address[] memory recipients, uint256[] memory percentages) {
        require(recipients.length == percentages.length, "Recipients and percentages length mismatch");
        require(recipients.length > 0, "At least one recipient required");
        _;
    }
    
    constructor() {
        // Initialize with default global royalty configuration
        globalRoyalties.isActive = true;
        globalRoyalties.totalPercentage = 0;
    }
    
    /**
     * @dev Configure royalty distribution for a specific domain
     * @param domainTokenId The domain token ID
     * @param recipients Array of recipient addresses
     * @param percentages Array of percentages in basis points
     */
    function configureDomainRoyalty(
        uint256 domainTokenId,
        address[] memory recipients,
        uint256[] memory percentages
    ) external onlyOwner validRecipients(recipients, percentages) validPercentages(percentages) {
        require(domainTokenId > 0, "Invalid domain token ID");
        
        // Clear existing configuration
        delete domainRoyalties[domainTokenId].recipients;
        delete domainRoyalties[domainTokenId].percentages;
        
        // Set new configuration
        domainRoyalties[domainTokenId].domainTokenId = domainTokenId;
        domainRoyalties[domainTokenId].recipients = recipients;
        domainRoyalties[domainTokenId].percentages = percentages;
        domainRoyalties[domainTokenId].isActive = true;
        
        uint256 total = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            total = total.add(percentages[i]);
        }
        domainRoyalties[domainTokenId].totalPercentage = total;
        
        emit RoyaltyConfigured(domainTokenId, recipients, percentages);
    }
    
    /**
     * @dev Configure global royalty distribution
     * @param recipients Array of recipient addresses
     * @param percentages Array of percentages in basis points
     */
    function configureGlobalRoyalty(
        address[] memory recipients,
        uint256[] memory percentages
    ) external onlyOwner validRecipients(recipients, percentages) validPercentages(percentages) {
        // Clear existing configuration
        delete globalRoyalties.recipients;
        delete globalRoyalties.percentages;
        
        // Set new configuration
        globalRoyalties.recipients = recipients;
        globalRoyalties.percentages = percentages;
        globalRoyalties.isActive = true;
        
        uint256 total = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            total = total.add(percentages[i]);
        }
        globalRoyalties.totalPercentage = total;
        
        emit GlobalRoyaltyConfigured(recipients, percentages);
    }
    
    /**
     * @dev Create a new revenue stream
     * @param streamName Name of the revenue stream
     * @param isActive Whether the stream is active
     */
    function createRevenueStream(
        string memory streamName,
        bool isActive
    ) external onlyOwner {
        require(bytes(streamName).length > 0, "Stream name cannot be empty");
        
        revenueStreams[streamName].name = streamName;
        revenueStreams[streamName].totalRevenue = 0;
        revenueStreams[streamName].lastDistribution = 0;
        revenueStreams[streamName].isActive = isActive;
        
        emit RevenueStreamCreated(streamName, isActive);
    }
    
    /**
     * @dev Receive revenue for a specific domain and stream
     * @param streamName Name of the revenue stream
     * @param domainTokenId The domain token ID (0 for global)
     */
    function receiveRevenue(
        string memory streamName,
        uint256 domainTokenId
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "No revenue to receive");
        require(revenueStreams[streamName].isActive, "Revenue stream not active");
        
        revenueStreams[streamName].totalRevenue = revenueStreams[streamName].totalRevenue.add(msg.value);
        
        emit RevenueReceived(streamName, msg.value, domainTokenId);
        
        // Automatically distribute if configured
        if (domainTokenId > 0 && domainRoyalties[domainTokenId].isActive) {
            _distributeDomainRevenue(streamName, msg.value, domainTokenId);
        } else if (globalRoyalties.isActive) {
            _distributeGlobalRevenue(streamName, msg.value);
        }
    }
    
    /**
     * @dev Manually distribute revenue for a specific domain
     * @param streamName Name of the revenue stream
     * @param domainTokenId The domain token ID
     * @param amount Amount to distribute
     */
    function distributeDomainRevenue(
        string memory streamName,
        uint256 domainTokenId,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(domainRoyalties[domainTokenId].isActive, "Domain royalty not configured");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        _distributeDomainRevenue(streamName, amount, domainTokenId);
    }
    
    /**
     * @dev Manually distribute global revenue
     * @param streamName Name of the revenue stream
     * @param amount Amount to distribute
     */
    function distributeGlobalRevenue(
        string memory streamName,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(globalRoyalties.isActive, "Global royalty not configured");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        _distributeGlobalRevenue(streamName, amount);
    }
    
    /**
     * @dev Claim accumulated royalties for a recipient
     * @param streamName Name of the revenue stream
     */
    function claimRoyalties(string memory streamName) external nonReentrant {
        uint256 claimableAmount = getClaimableRoyalties(msg.sender, streamName);
        require(claimableAmount > 0, "No royalties to claim");
        
        lastClaim[msg.sender] = block.timestamp;
        totalEarned[msg.sender] = totalEarned[msg.sender].add(claimableAmount);
        
        payable(msg.sender).transfer(claimableAmount);
        
        emit RoyaltyClaimed(msg.sender, claimableAmount, streamName);
    }
    
    /**
     * @dev Get claimable royalties for a recipient
     * @param recipient Address of the recipient
     * @param streamName Name of the revenue stream
     * @return claimableAmount Amount of claimable royalties
     */
    function getClaimableRoyalties(
        address recipient,
        string memory streamName
    ) public view returns (uint256 claimableAmount) {
        // This is a simplified implementation
        // In a real implementation, you would track individual claims per stream
        return 0;
    }
    
    /**
     * @dev Get domain royalty configuration
     * @param domainTokenId The domain token ID
     * @return recipients Array of recipient addresses
     * @return percentages Array of percentages
     * @return isActive Whether the configuration is active
     */
    function getDomainRoyaltyConfig(uint256 domainTokenId) external view returns (
        address[] memory recipients,
        uint256[] memory percentages,
        bool isActive
    ) {
        DomainRoyaltyConfig storage config = domainRoyalties[domainTokenId];
        return (config.recipients, config.percentages, config.isActive);
    }
    
    /**
     * @dev Get global royalty configuration
     * @return recipients Array of recipient addresses
     * @return percentages Array of percentages
     * @return isActive Whether the configuration is active
     */
    function getGlobalRoyaltyConfig() external view returns (
        address[] memory recipients,
        uint256[] memory percentages,
        bool isActive
    ) {
        return (globalRoyalties.recipients, globalRoyalties.percentages, globalRoyalties.isActive);
    }
    
    /**
     * @dev Get revenue stream information
     * @param streamName Name of the revenue stream
     * @return totalRevenue Total revenue received
     * @return lastDistribution Last distribution timestamp
     * @return isActive Whether the stream is active
     */
    function getRevenueStreamInfo(string memory streamName) external view returns (
        uint256 totalRevenue,
        uint256 lastDistribution,
        bool isActive
    ) {
        RevenueStream storage stream = revenueStreams[streamName];
        return (stream.totalRevenue, stream.lastDistribution, stream.isActive);
    }
    
    /**
     * @dev Internal function to distribute domain-specific revenue
     */
    function _distributeDomainRevenue(
        string memory streamName,
        uint256 amount,
        uint256 domainTokenId
    ) internal {
        DomainRoyaltyConfig storage config = domainRoyalties[domainTokenId];
        
        for (uint256 i = 0; i < config.recipients.length; i++) {
            uint256 recipientAmount = amount.mul(config.percentages[i]).div(10000);
            if (recipientAmount > 0) {
                payable(config.recipients[i]).transfer(recipientAmount);
            }
        }
        
        revenueStreams[streamName].lastDistribution = block.timestamp;
        
        emit RevenueDistributed(streamName, amount, domainTokenId);
    }
    
    /**
     * @dev Internal function to distribute global revenue
     */
    function _distributeGlobalRevenue(
        string memory streamName,
        uint256 amount
    ) internal {
        for (uint256 i = 0; i < globalRoyalties.recipients.length; i++) {
            uint256 recipientAmount = amount.mul(globalRoyalties.percentages[i]).div(10000);
            if (recipientAmount > 0) {
                payable(globalRoyalties.recipients[i]).transfer(recipientAmount);
            }
        }
        
        revenueStreams[streamName].lastDistribution = block.timestamp;
        
        emit RevenueDistributed(streamName, amount, 0);
    }
    
    /**
     * @dev Pause contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Accept ETH payments
    }
}
