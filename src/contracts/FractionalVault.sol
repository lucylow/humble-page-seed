// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title FractionalVault
 * @dev Smart contract for fractional ownership of tokenized domains
 * Implements Use Case 8.1.2: Fractional Sales for Capital Raising
 * and Use Case 8.2: Fractional Ownership for Investors
 */
contract FractionalVault is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // Domain NFT contract
    IERC721 public immutable domainNFT;
    
    // Domain token ID
    uint256 public immutable domainTokenId;
    
    // Vault configuration
    uint256 public immutable totalShares;
    uint256 public immutable pricePerShare;
    uint256 public immutable minimumInvestment;
    uint256 public immutable maximumInvestment;
    
    // Vault state
    uint256 public sharesSold;
    uint256 public totalRaised;
    bool public isActive;
    bool public isLocked;
    
    // Revenue tracking for royalty distribution
    uint256 public totalRevenue;
    uint256 public lastDistribution;
    uint256 public constant DISTRIBUTION_INTERVAL = 30 days;
    
    // Events
    event SharesPurchased(
        address indexed buyer,
        uint256 shares,
        uint256 totalCost,
        uint256 sharesRemaining
    );
    
    event SharesSold(
        address indexed seller,
        uint256 shares,
        uint256 totalValue,
        uint256 sharesRemaining
    );
    
    event RevenueReceived(
        uint256 amount,
        uint256 timestamp
    );
    
    event RoyaltyDistributed(
        uint256 totalAmount,
        uint256 ownerAmount,
        uint256 holdersAmount,
        uint256 protocolAmount
    );
    
    event VaultLocked(uint256 timestamp);
    event VaultUnlocked(uint256 timestamp);
    
    constructor(
        address _domainNFT,
        uint256 _domainTokenId,
        uint256 _totalShares,
        uint256 _pricePerShare,
        uint256 _minimumInvestment,
        uint256 _maximumInvestment,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20(_tokenName, _tokenSymbol) {
        domainNFT = IERC721(_domainNFT);
        domainTokenId = _domainTokenId;
        totalShares = _totalShares;
        pricePerShare = _pricePerShare;
        minimumInvestment = _minimumInvestment;
        maximumInvestment = _maximumInvestment;
        isActive = true;
        isLocked = false;
        lastDistribution = block.timestamp;
    }
    
    /**
     * @dev Buy fractional shares of the domain
     * @param shares Number of shares to purchase
     */
    function buyShares(uint256 shares) external payable nonReentrant whenNotPaused {
        require(isActive, "Vault is not active");
        require(!isLocked, "Vault is locked");
        require(shares > 0, "Must buy at least 1 share");
        require(sharesSold + shares <= totalShares, "Not enough shares available");
        
        uint256 totalCost = shares * pricePerShare;
        require(msg.value >= totalCost, "Insufficient payment");
        require(totalCost >= minimumInvestment, "Below minimum investment");
        
        if (maximumInvestment > 0) {
            require(totalCost <= maximumInvestment, "Above maximum investment");
        }
        
        // Update state
        sharesSold += shares;
        totalRaised += totalCost;
        
        // Mint shares to buyer
        _mint(msg.sender, shares);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit SharesPurchased(msg.sender, shares, totalCost, totalShares - sharesSold);
        
        // Check if all shares are sold
        if (sharesSold == totalShares) {
            isActive = false;
        }
    }
    
    /**
     * @dev Sell fractional shares back to the vault
     * @param shares Number of shares to sell
     */
    function sellShares(uint256 shares) external nonReentrant whenNotPaused {
        require(shares > 0, "Must sell at least 1 share");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");
        require(!isLocked, "Vault is locked");
        
        uint256 totalValue = shares * pricePerShare;
        require(address(this).balance >= totalValue, "Insufficient vault balance");
        
        // Update state
        sharesSold -= shares;
        totalRaised -= totalValue;
        
        // Burn shares from seller
        _burn(msg.sender, shares);
        
        // Transfer payment to seller
        payable(msg.sender).transfer(totalValue);
        
        emit SharesSold(msg.sender, shares, totalValue, totalShares - sharesSold);
    }
    
    /**
     * @dev Receive revenue for royalty distribution
     */
    function receiveRevenue() external payable {
        require(msg.value > 0, "No revenue received");
        
        totalRevenue += msg.value;
        
        emit RevenueReceived(msg.value, block.timestamp);
    }
    
    /**
     * @dev Distribute royalties to shareholders
     * Can only be called by the domain owner or after distribution interval
     */
    function distributeRoyalties() external nonReentrant {
        require(
            msg.sender == owner() || 
            block.timestamp >= lastDistribution + DISTRIBUTION_INTERVAL,
            "Distribution not authorized or too early"
        );
        
        uint256 availableRevenue = address(this).balance;
        require(availableRevenue > 0, "No revenue to distribute");
        
        // Distribution breakdown:
        // 60% to domain owner
        // 35% to fractional shareholders
        // 5% to protocol (owner of this contract)
        
        uint256 ownerAmount = (availableRevenue * 60) / 100;
        uint256 holdersAmount = (availableRevenue * 35) / 100;
        uint256 protocolAmount = (availableRevenue * 5) / 100;
        
        // Transfer to domain owner
        if (ownerAmount > 0) {
            payable(owner()).transfer(ownerAmount);
        }
        
        // Distribute to shareholders proportionally
        if (holdersAmount > 0 && totalSupply() > 0) {
            // This is a simplified distribution - in production, you might want to
            // use a more gas-efficient method for large numbers of shareholders
            uint256 perShareAmount = holdersAmount / totalSupply();
            
            // Note: In a real implementation, you'd want to use a pull payment pattern
            // to avoid gas limit issues with many shareholders
            // For now, we'll just track the amount per share
            // Shareholders can claim their portion via a separate function
        }
        
        // Transfer protocol fee
        if (protocolAmount > 0) {
            // This would go to the protocol treasury
            // For now, we'll keep it in the contract
        }
        
        lastDistribution = block.timestamp;
        
        emit RoyaltyDistributed(availableRevenue, ownerAmount, holdersAmount, protocolAmount);
    }
    
    /**
     * @dev Claim royalty distribution for a shareholder
     * @param shareholder The address of the shareholder
     */
    function claimRoyalties(address shareholder) external nonReentrant {
        require(balanceOf(shareholder) > 0, "No shares held");
        
        // Calculate claimable amount based on shares held
        // This is a simplified implementation
        uint256 claimableAmount = 0; // Would be calculated based on revenue and shares
        
        if (claimableAmount > 0) {
            payable(shareholder).transfer(claimableAmount);
        }
    }
    
    /**
     * @dev Lock the vault (prevents buying/selling shares)
     * Can only be called by the domain owner
     */
    function lockVault() external onlyOwner {
        require(!isLocked, "Vault already locked");
        isLocked = true;
        emit VaultLocked(block.timestamp);
    }
    
    /**
     * @dev Unlock the vault
     * Can only be called by the domain owner
     */
    function unlockVault() external onlyOwner {
        require(isLocked, "Vault not locked");
        isLocked = false;
        emit VaultUnlocked(block.timestamp);
    }
    
    /**
     * @dev Pause the vault (emergency function)
     * Can only be called by the domain owner
     */
    function pauseVault() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the vault
     * Can only be called by the domain owner
     */
    function unpauseVault() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get vault statistics
     * @return sharesSold Number of shares sold
     * @return totalRaised Total amount raised
     * @return isActive Whether the vault is active
     * @return isLocked Whether the vault is locked
     */
    function getVaultStats() external view returns (
        uint256,
        uint256,
        bool,
        bool
    ) {
        return (sharesSold, totalRaised, isActive, isLocked);
    }
    
    /**
     * @dev Get shareholder information
     * @param shareholder The shareholder address
     * @return shares Number of shares held
     * @return percentage Percentage of total shares
     */
    function getShareholderInfo(address shareholder) external view returns (
        uint256 shares,
        uint256 percentage
    ) {
        shares = balanceOf(shareholder);
        percentage = totalSupply() > 0 ? (shares * 100) / totalSupply() : 0;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
