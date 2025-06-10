// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IIdentityRegistry {
    function getUserRole(address user) external view returns (uint8);
    // 0: Unset, 1: Tenant, 2: Landlord
}

contract PropertyToken is ERC1155, Ownable {
    uint256 private nextTokenId;
    mapping(uint256 => address) public landlordOf;
    mapping(uint256 => string) private tokenURIs;

    uint256 public constant TOKEN_SUPPLY_PER_PROPERTY = 100;

    event PropertyTokenMinted(uint256 indexed tokenId, address indexed landlord, uint256 amount, string uri);
    event PropertyTokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 amount);

    IIdentityRegistry public identityRegistry;

    modifier onlyLandlord() {
        require(identityRegistry.getUserRole(msg.sender) == 2, "Not a landlord");
        _;
    }

    constructor(address _identityRegistry) ERC1155("") {
        identityRegistry = IIdentityRegistry(_identityRegistry);
    }

    function mintPropertyToken(string memory uri) external onlyLandlord returns (uint256) {
        uint256 tokenId = nextTokenId;
        landlordOf[tokenId] = msg.sender;
        tokenURIs[tokenId] = uri;

        _mint(msg.sender, tokenId, TOKEN_SUPPLY_PER_PROPERTY, "");
        emit PropertyTokenMinted(tokenId, msg.sender, TOKEN_SUPPLY_PER_PROPERTY, uri);

        nextTokenId++;
        return tokenId;
    }

    function getPropertyMetadataUri(uint256 tokenId) public view returns (string memory) {
        return tokenURIs[tokenId];
    }

    function isLandlordOf(address user, uint256 tokenId) public view returns (bool) {
        return landlordOf[tokenId] == user;
    }

    function transferFraction(address to, uint256 tokenId, uint256 amount) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        _safeTransferFrom(msg.sender, to, tokenId, amount, "");
    }

}
