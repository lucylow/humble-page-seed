// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DomaIntegrationHelper
 * @dev Helper contract for Doma protocol integration
 */
contract DomaIntegrationHelper is Ownable {
    // ============ CONSTANTS ============
    
    address public constant DOMA_MARKETPLACE = 0x742d35Cc6634C0532925a3b844Bc454e4438f44e;
    address public constant DOMA_REGISTRAR = 0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c;
    address public constant DOMA_RESOLVER = 0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3;
    
    // ============ STORAGE ============
    
    mapping(address => bool) public whitelistedNftContracts;
    
    // ============ EVENTS ============
    
    event NftContractWhitelisted(address nftContract);
    event NftContractRemoved(address nftContract);
    
    // ============ MODIFIERS ============
    
    modifier onlyWhitelisted(address nftContract) {
        require(whitelistedNftContracts[nftContract], "NFT contract not whitelisted");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Initialize with known Doma NFT contracts
        whitelistedNftContracts[0x742d35Cc6634C0532925a3b844Bc454e4438f44e] = true; // Doma Main NFT
        whitelistedNftContracts[0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c] = true; // Doma Premium NFT
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Verify domain ownership through Doma protocol
     */
    function verifyDomainOwnership(
        address nftContract,
        uint256 tokenId,
        address allegedOwner
    ) external view onlyWhitelisted(nftContract) returns (bool) {
        try IERC721(nftContract).ownerOf(tokenId) returns (address owner) {
            return owner == allegedOwner;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Get domain metadata from Doma protocol
     */
    function getDomainMetadata(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (string memory) {
        (bool success, bytes memory data) = nftContract.staticcall(
            abi.encodeWithSignature("tokenURI(uint256)", tokenId)
        );
        
        if (success) {
            return abi.decode(data, (string));
        }
        
        return "";
    }
    
    /**
     * @dev Check if domain is available for transfer
     */
    function isDomainTransferable(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (bool) {
        // Check if domain is locked in Doma protocol
        (bool success, bytes memory data) = DOMA_REGISTRAR.staticcall(
            abi.encodeWithSignature("isTransferLocked(address,uint256)", nftContract, tokenId)
        );
        
        if (success) {
            return !abi.decode(data, (bool));
        }
        
        return true;
    }
    
    /**
     * @dev Get domain expiration info from Doma registrar
     */
    function getDomainExpiration(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (uint256) {
        (bool success, bytes memory data) = DOMA_REGISTRAR.staticcall(
            abi.encodeWithSignature("getExpirationTime(address,uint256)", nftContract, tokenId)
        );
        
        if (success) {
            return abi.decode(data, (uint256));
        }
        
        return type(uint256).max;
    }
    
    /**
     * @dev Get domain registration info from Doma registrar
     */
    function getDomainRegistrationInfo(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (
        address registrar,
        uint256 registrationTime,
        uint256 expirationTime,
        bool isActive
    ) {
        (bool success, bytes memory data) = DOMA_REGISTRAR.staticcall(
            abi.encodeWithSignature("getRegistrationInfo(address,uint256)", nftContract, tokenId)
        );
        
        if (success) {
            (registrar, registrationTime, expirationTime, isActive) = abi.decode(data, (address, uint256, uint256, bool));
        } else {
            registrar = address(0);
            registrationTime = 0;
            expirationTime = type(uint256).max;
            isActive = false;
        }
    }
    
    /**
     * @dev Check if domain is verified by Doma protocol
     */
    function isDomainVerified(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (bool) {
        (bool success, bytes memory data) = DOMA_REGISTRAR.staticcall(
            abi.encodeWithSignature("isVerified(address,uint256)", nftContract, tokenId)
        );
        
        if (success) {
            return abi.decode(data, (bool));
        }
        
        return false;
    }
    
    /**
     * @dev Get domain resolver address
     */
    function getDomainResolver(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (address) {
        (bool success, bytes memory data) = DOMA_RESOLVER.staticcall(
            abi.encodeWithSignature("resolver(address,uint256)", nftContract, tokenId)
        );
        
        if (success) {
            return abi.decode(data, (address));
        }
        
        return address(0);
    }
    
    /**
     * @dev Resolve domain name to address
     */
    function resolveDomain(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (address) {
        (bool success, bytes memory data) = DOMA_RESOLVER.staticcall(
            abi.encodeWithSignature("addr(address,uint256)", nftContract, tokenId)
        );
        
        if (success) {
            return abi.decode(data, (address));
        }
        
        return address(0);
    }
    
    /**
     * @dev Get domain name from token ID
     */
    function getDomainName(
        address nftContract,
        uint256 tokenId
    ) external view onlyWhitelisted(nftContract) returns (string memory) {
        (bool success, bytes memory data) = nftContract.staticcall(
            abi.encodeWithSignature("name(uint256)", tokenId)
        );
        
        if (success) {
            return abi.decode(data, (string));
        }
        
        return "";
    }
    
    /**
     * @dev Check if domain supports specific interface
     */
    function supportsInterface(
        address nftContract,
        bytes4 interfaceId
    ) external view onlyWhitelisted(nftContract) returns (bool) {
        (bool success, bytes memory data) = nftContract.staticcall(
            abi.encodeWithSignature("supportsInterface(bytes4)", interfaceId)
        );
        
        if (success) {
            return abi.decode(data, (bool));
        }
        
        return false;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function whitelistNftContract(address nftContract) external onlyOwner {
        whitelistedNftContracts[nftContract] = true;
        emit NftContractWhitelisted(nftContract);
    }
    
    function removeNftContract(address nftContract) external onlyOwner {
        whitelistedNftContracts[nftContract] = false;
        emit NftContractRemoved(nftContract);
    }
    
    function batchWhitelistNftContracts(address[] calldata nftContracts) external onlyOwner {
        for (uint256 i = 0; i < nftContracts.length; i++) {
            whitelistedNftContracts[nftContracts[i]] = true;
            emit NftContractWhitelisted(nftContracts[i]);
        }
    }
    
    function batchRemoveNftContracts(address[] calldata nftContracts) external onlyOwner {
        for (uint256 i = 0; i < nftContracts.length; i++) {
            whitelistedNftContracts[nftContracts[i]] = false;
            emit NftContractRemoved(nftContracts[i]);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get all whitelisted NFT contracts
     */
    function getWhitelistedContracts() external view returns (address[] memory) {
        // This is a simplified implementation
        // In production, you would maintain a list of whitelisted contracts
        address[] memory contracts = new address[](2);
        contracts[0] = 0x742d35Cc6634C0532925a3b844Bc454e4438f44e;
        contracts[1] = 0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c;
        return contracts;
    }
    
    /**
     * @dev Check if contract is whitelisted
     */
    function isWhitelisted(address nftContract) external view returns (bool) {
        return whitelistedNftContracts[nftContract];
    }
}

// ============ INTERFACES ============

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function getApproved(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function tokenURI(uint256 tokenId) external view returns (string memory);
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


