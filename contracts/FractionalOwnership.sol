// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./DomainTokenization.sol";

/**
 * @title FractionalOwnership
 * @dev Enables fractional ownership of domain NFTs with AMM integration and buyout mechanisms
 */
contract FractionalOwnership is ERC20, Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    
    // The underlying domain NFT
    IERC721 public immutable domainNFT;
    uint256 public immutable domainTokenId;
    
    // Fractional ownership parameters
    uint256 public immutable totalShares;
    uint256 public immutable minimumInvestment;
    uint256 public immutable buyoutPrice;
    uint256 public immutable buyoutDeadline;
    
    // AMM parameters
    uint256 public domainTokenReserve;
    uint256 public baseTokenReserve;
    uint256 public constant FEE_RATE = 300; // 3% fee (300 basis points)
    uint256 public constant K_MULTIPLIER = 1000000; // For precision
    
    // State variables
    bool public isBuyoutTriggered;
    bool public isBuyoutCompleted;
    address public buyoutInitiator;
    uint256 public buyoutAmount;
    
    // Revenue sharing
    uint256 public totalRevenue;
    mapping(address => uint256) public lastRevenueClaim;
    
    // Events
    event Fractionalized(
        uint256 indexed domainTokenId,
        uint256 totalShares,
        uint256 buyoutPrice,
        uint256 buyoutDeadline
    );
    
    event SharePurchased(
        address indexed buyer,
        uint256 shares,
        uint256 baseTokenAmount,
        uint256 domainTokenAmount
    );
    
    event ShareSold(
        address indexed seller,
        uint256 shares,
        uint256 baseTokenAmount,
        uint256 domainTokenAmount
    );
    
    event LiquidityAdded(
        address indexed provider,
        uint256 baseTokenAmount,
        uint256 domainTokenAmount,
        uint256 liquidityTokens
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 baseTokenAmount,
        uint256 domainTokenAmount,
        uint256 liquidityTokens
    );
    
    event BuyoutInitiated(
        address indexed initiator,
        uint256 amount,
        uint256 deadline
    );
    
    event BuyoutCompleted(
        address indexed initiator,
        uint256 totalAmount
    );
    
    event RevenueDistributed(
        uint256 totalAmount,
        uint256 perShare
    );
    
    // Modifiers
    modifier onlyBeforeBuyout() {
        require(!isBuyoutTriggered, "Buyout already triggered");
        _;
    }
    
    modifier onlyAfterBuyout() {
        require(isBuyoutTriggered, "Buyout not triggered");
        _;
    }
    
    modifier onlyBeforeDeadline() {
        require(block.timestamp <= buyoutDeadline, "Buyout deadline passed");
        _;
    }
    
    constructor(
        address _domainNFT,
        uint256 _domainTokenId,
        uint256 _totalShares,
        uint256 _minimumInvestment,
        uint256 _buyoutPrice,
        uint256 _buyoutDeadline,
        string memory _shareName,
        string memory _shareSymbol
    ) ERC20(_shareName, _shareSymbol) {
        require(_domainNFT != address(0), "Invalid domain NFT address");
        require(_totalShares > 0, "Total shares must be greater than 0");
        require(_minimumInvestment > 0, "Minimum investment must be greater than 0");
        require(_buyoutPrice > 0, "Buyout price must be greater than 0");
        require(_buyoutDeadline > block.timestamp, "Buyout deadline must be in the future");
        
        domainNFT = IERC721(_domainNFT);
        domainTokenId = _domainTokenId;
        totalShares = _totalShares;
        minimumInvestment = _minimumInvestment;
        buyoutPrice = _buyoutPrice;
        buyoutDeadline = _buyoutDeadline;
        
        // Transfer the domain NFT to this contract
        domainNFT.transferFrom(msg.sender, address(this), _domainTokenId);
        
        // Initialize AMM with initial liquidity
        domainTokenReserve = _totalShares;
        baseTokenReserve = _buyoutPrice;
        
        emit Fractionalized(_domainTokenId, _totalShares, _buyoutPrice, _buyoutDeadline);
    }
    
    /**
     * @dev Purchase fractional shares using base tokens
     * @param baseTokenAmount Amount of base tokens to spend
     * @param minShares Minimum shares to receive (slippage protection)
     */
    function purchaseShares(
        uint256 baseTokenAmount,
        uint256 minShares
    ) external payable onlyBeforeBuyout nonReentrant whenNotPaused {
        require(baseTokenAmount >= minimumInvestment, "Amount below minimum investment");
        require(baseTokenAmount > 0, "Amount must be greater than 0");
        
        // Calculate shares to receive using AMM formula
        uint256 shares = calculateSharesOut(baseTokenAmount);
        require(shares >= minShares, "Insufficient shares received");
        require(shares <= totalShares, "Insufficient shares available");
        
        // Update reserves
        baseTokenReserve = baseTokenReserve.add(baseTokenAmount);
        domainTokenReserve = domainTokenReserve.sub(shares);
        
        // Mint shares to buyer
        _mint(msg.sender, shares);
        
        // Transfer base tokens from buyer
        require(msg.value >= baseTokenAmount, "Insufficient payment");
        if (msg.value > baseTokenAmount) {
            payable(msg.sender).transfer(msg.value - baseTokenAmount);
        }
        
        emit SharePurchased(msg.sender, shares, baseTokenAmount, shares);
    }
    
    /**
     * @dev Sell fractional shares for base tokens
     * @param shares Amount of shares to sell
     * @param minBaseTokenAmount Minimum base tokens to receive (slippage protection)
     */
    function sellShares(
        uint256 shares,
        uint256 minBaseTokenAmount
    ) external onlyBeforeBuyout nonReentrant whenNotPaused {
        require(shares > 0, "Shares must be greater than 0");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        // Calculate base tokens to receive using AMM formula
        uint256 baseTokenAmount = calculateBaseTokensOut(shares);
        require(baseTokenAmount >= minBaseTokenAmount, "Insufficient base tokens received");
        require(baseTokenAmount <= baseTokenReserve, "Insufficient base token reserve");
        
        // Update reserves
        baseTokenReserve = baseTokenReserve.sub(baseTokenAmount);
        domainTokenReserve = domainTokenReserve.add(shares);
        
        // Burn shares from seller
        _burn(msg.sender, shares);
        
        // Transfer base tokens to seller
        payable(msg.sender).transfer(baseTokenAmount);
        
        emit ShareSold(msg.sender, shares, baseTokenAmount, shares);
    }
    
    /**
     * @dev Add liquidity to the AMM pool
     * @param baseTokenAmount Amount of base tokens to add
     * @param domainTokenAmount Amount of domain tokens to add
     */
    function addLiquidity(
        uint256 baseTokenAmount,
        uint256 domainTokenAmount
    ) external payable onlyBeforeBuyout nonReentrant whenNotPaused {
        require(baseTokenAmount > 0 && domainTokenAmount > 0, "Amounts must be greater than 0");
        
        // Calculate liquidity tokens to mint
        uint256 liquidityTokens;
        if (totalSupply() == 0) {
            liquidityTokens = baseTokenAmount;
        } else {
            uint256 baseTokenLiquidity = baseTokenAmount.mul(totalSupply()).div(baseTokenReserve);
            uint256 domainTokenLiquidity = domainTokenAmount.mul(totalSupply()).div(domainTokenReserve);
            liquidityTokens = baseTokenLiquidity < domainTokenLiquidity ? baseTokenLiquidity : domainTokenLiquidity;
        }
        
        require(liquidityTokens > 0, "Insufficient liquidity tokens");
        
        // Update reserves
        baseTokenReserve = baseTokenReserve.add(baseTokenAmount);
        domainTokenReserve = domainTokenReserve.add(domainTokenAmount);
        
        // Mint liquidity tokens
        _mint(msg.sender, liquidityTokens);
        
        // Transfer base tokens from provider
        require(msg.value >= baseTokenAmount, "Insufficient payment");
        if (msg.value > baseTokenAmount) {
            payable(msg.sender).transfer(msg.value - baseTokenAmount);
        }
        
        emit LiquidityAdded(msg.sender, baseTokenAmount, domainTokenAmount, liquidityTokens);
    }
    
    /**
     * @dev Remove liquidity from the AMM pool
     * @param liquidityTokens Amount of liquidity tokens to burn
     */
    function removeLiquidity(
        uint256 liquidityTokens
    ) external onlyBeforeBuyout nonReentrant whenNotPaused {
        require(liquidityTokens > 0, "Liquidity tokens must be greater than 0");
        require(balanceOf(msg.sender) >= liquidityTokens, "Insufficient liquidity tokens");
        
        // Calculate amounts to return
        uint256 baseTokenAmount = liquidityTokens.mul(baseTokenReserve).div(totalSupply());
        uint256 domainTokenAmount = liquidityTokens.mul(domainTokenReserve).div(totalSupply());
        
        // Update reserves
        baseTokenReserve = baseTokenReserve.sub(baseTokenAmount);
        domainTokenReserve = domainTokenReserve.sub(domainTokenAmount);
        
        // Burn liquidity tokens
        _burn(msg.sender, liquidityTokens);
        
        // Transfer tokens to provider
        payable(msg.sender).transfer(baseTokenAmount);
        
        emit LiquidityRemoved(msg.sender, baseTokenAmount, domainTokenAmount, liquidityTokens);
    }
    
    /**
     * @dev Initiate buyout process
     * @param amount Amount to pay for buyout
     */
    function initiateBuyout(uint256 amount) external payable onlyBeforeBuyout onlyBeforeDeadline nonReentrant {
        require(amount >= buyoutPrice, "Insufficient buyout amount");
        require(!isBuyoutTriggered, "Buyout already triggered");
        
        isBuyoutTriggered = true;
        buyoutInitiator = msg.sender;
        buyoutAmount = amount;
        
        // Transfer buyout amount to contract
        require(msg.value >= amount, "Insufficient payment");
        if (msg.value > amount) {
            payable(msg.sender).transfer(msg.value - amount);
        }
        
        emit BuyoutInitiated(msg.sender, amount, buyoutDeadline);
    }
    
    /**
     * @dev Complete buyout process
     */
    function completeBuyout() external onlyAfterBuyout nonReentrant {
        require(block.timestamp <= buyoutDeadline, "Buyout deadline passed");
        require(!isBuyoutCompleted, "Buyout already completed");
        
        isBuyoutCompleted = true;
        
        // Transfer domain NFT to buyout initiator
        domainNFT.transferFrom(address(this), buyoutInitiator, domainTokenId);
        
        // Distribute buyout proceeds to shareholders
        uint256 totalSharesOutstanding = totalSupply();
        if (totalSharesOutstanding > 0) {
            uint256 proceedsPerShare = buyoutAmount.div(totalSharesOutstanding);
            
            // Transfer proceeds to shareholders
            for (uint256 i = 0; i < totalSharesOutstanding; i++) {
                address shareholder = _getShareholder(i);
                if (shareholder != address(0)) {
                    uint256 shareholderShares = balanceOf(shareholder);
                    uint256 shareholderProceeds = proceedsPerShare.mul(shareholderShares);
                    payable(shareholder).transfer(shareholderProceeds);
                }
            }
        }
        
        emit BuyoutCompleted(buyoutInitiator, buyoutAmount);
    }
    
    /**
     * @dev Distribute revenue to shareholders
     */
    function distributeRevenue() external payable onlyOwner {
        require(msg.value > 0, "No revenue to distribute");
        
        totalRevenue = totalRevenue.add(msg.value);
        uint256 totalSharesOutstanding = totalSupply();
        
        if (totalSharesOutstanding > 0) {
            uint256 revenuePerShare = msg.value.div(totalSharesOutstanding);
            
            // Update last revenue claim for all shareholders
            for (uint256 i = 0; i < totalSharesOutstanding; i++) {
                address shareholder = _getShareholder(i);
                if (shareholder != address(0)) {
                    lastRevenueClaim[shareholder] = totalRevenue;
                }
            }
            
            emit RevenueDistributed(msg.value, revenuePerShare);
        }
    }
    
    /**
     * @dev Claim accumulated revenue
     */
    function claimRevenue() external nonReentrant {
        uint256 claimableRevenue = getClaimableRevenue(msg.sender);
        require(claimableRevenue > 0, "No revenue to claim");
        
        lastRevenueClaim[msg.sender] = totalRevenue;
        payable(msg.sender).transfer(claimableRevenue);
    }
    
    /**
     * @dev Calculate shares to receive for given base token amount
     */
    function calculateSharesOut(uint256 baseTokenAmount) public view returns (uint256) {
        uint256 baseTokenAmountWithFee = baseTokenAmount.mul(10000 - FEE_RATE);
        uint256 numerator = baseTokenAmountWithFee.mul(domainTokenReserve);
        uint256 denominator = baseTokenReserve.mul(10000).add(baseTokenAmountWithFee);
        return numerator.div(denominator);
    }
    
    /**
     * @dev Calculate base tokens to receive for given shares
     */
    function calculateBaseTokensOut(uint256 shares) public view returns (uint256) {
        uint256 sharesWithFee = shares.mul(10000 - FEE_RATE);
        uint256 numerator = sharesWithFee.mul(baseTokenReserve);
        uint256 denominator = domainTokenReserve.mul(10000).add(sharesWithFee);
        return numerator.div(denominator);
    }
    
    /**
     * @dev Get claimable revenue for a shareholder
     */
    function getClaimableRevenue(address shareholder) public view returns (uint256) {
        uint256 shareholderShares = balanceOf(shareholder);
        if (shareholderShares == 0) return 0;
        
        uint256 totalSharesOutstanding = totalSupply();
        if (totalSharesOutstanding == 0) return 0;
        
        uint256 revenuePerShare = totalRevenue.sub(lastRevenueClaim[shareholder]);
        return revenuePerShare.mul(shareholderShares).div(totalSharesOutstanding);
    }
    
    /**
     * @dev Get current price of domain token in base tokens
     */
    function getCurrentPrice() public view returns (uint256) {
        if (domainTokenReserve == 0) return 0;
        return baseTokenReserve.mul(K_MULTIPLIER).div(domainTokenReserve);
    }
    
    /**
     * @dev Get AMM pool information
     */
    function getPoolInfo() external view returns (
        uint256 _domainTokenReserve,
        uint256 _baseTokenReserve,
        uint256 _totalShares,
        uint256 _currentPrice
    ) {
        return (
            domainTokenReserve,
            baseTokenReserve,
            totalShares,
            getCurrentPrice()
        );
    }
    
    /**
     * @dev Get buyout information
     */
    function getBuyoutInfo() external view returns (
        bool _isBuyoutTriggered,
        bool _isBuyoutCompleted,
        address _buyoutInitiator,
        uint256 _buyoutAmount,
        uint256 _buyoutDeadline
    ) {
        return (
            isBuyoutTriggered,
            isBuyoutCompleted,
            buyoutInitiator,
            buyoutAmount,
            buyoutDeadline
        );
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
     * @dev Get shareholder at index (helper function)
     */
    function _getShareholder(uint256 index) internal view returns (address) {
        // This is a simplified implementation
        // In a real implementation, you would maintain a list of shareholders
        return address(0);
    }
}
