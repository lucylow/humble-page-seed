// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DomaLand {
    struct Domain {
        string name;
        address owner;
        uint256 price;
        bool isListed;
        uint256 tokenId;
    }

    mapping(string => Domain) public domains;
    mapping(address => string[]) public userDomains;
    
    address public owner;
    uint256 public totalDomains;
    uint256 public nextTokenId = 1;

    event DomainRegistered(string indexed name, address indexed owner, uint256 tokenId);
    event DomainListed(string indexed name, uint256 price);
    event DomainPurchased(string indexed name, address indexed buyer, uint256 price);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function registerDomain(string memory _name) public {
        require(domains[_name].owner == address(0), "Domain already exists");
        
        domains[_name] = Domain({
            name: _name,
            owner: msg.sender,
            price: 0,
            isListed: false,
            tokenId: nextTokenId
        });
        
        userDomains[msg.sender].push(_name);
        totalDomains++;
        nextTokenId++;
        
        emit DomainRegistered(_name, msg.sender, nextTokenId - 1);
    }

    function listDomain(string memory _name, uint256 _price) public {
        require(domains[_name].owner == msg.sender, "Not the owner of this domain");
        require(_price > 0, "Price must be greater than 0");
        
        domains[_name].price = _price;
        domains[_name].isListed = true;
        
        emit DomainListed(_name, _price);
    }

    function purchaseDomain(string memory _name) public payable {
        require(domains[_name].isListed, "Domain is not listed");
        require(msg.value >= domains[_name].price, "Insufficient payment");
        require(domains[_name].owner != msg.sender, "Cannot purchase your own domain");
        
        address previousOwner = domains[_name].owner;
        
        // Transfer ownership
        domains[_name].owner = msg.sender;
        domains[_name].isListed = false;
        domains[_name].price = 0;
        
        // Update user domains
        userDomains[msg.sender].push(_name);
        
        // Remove from previous owner's list
        _removeFromUserDomains(previousOwner, _name);
        
        // Transfer payment to previous owner
        payable(previousOwner).transfer(msg.value);
        
        emit DomainPurchased(_name, msg.sender, msg.value);
    }

    function _removeFromUserDomains(address _user, string memory _name) private {
        string[] storage userDomainList = userDomains[_user];
        for (uint i = 0; i < userDomainList.length; i++) {
            if (keccak256(bytes(userDomainList[i])) == keccak256(bytes(_name))) {
                userDomainList[i] = userDomainList[userDomainList.length - 1];
                userDomainList.pop();
                break;
            }
        }
    }

    function getUserDomains(address _user) public view returns (string[] memory) {
        return userDomains[_user];
    }

    function getDomainInfo(string memory _name) public view returns (Domain memory) {
        return domains[_name];
    }
}
