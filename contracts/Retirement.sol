// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./CarbonMarket.sol";

contract Retirement is ERC721URIStorage {
    struct RetirementItem {
        uint256 tokenId;
        uint256 amount;
        address owner;
        uint256 projectId;
        uint256 timestamp;
        bool isCertificated;
    }

    event RetirementItemCreated(
        uint256 tokenId,
        uint256 projectId,
        uint256 amount
    );

    uint256 private _retirementIdCounter;
    mapping(uint256 => RetirementItem) private _idToRetirementItem;
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    mapping(uint256 => uint256) private _idToOwnedIndex;

    uint256[] private _allRetirements;
    mapping(uint256 => uint256) private _idToRetirementIndex;

    CarbonMarket private _market;

    constructor(address _marketAddress) ERC721("RetirementToken", "RT") {
        _market = CarbonMarket(_marketAddress);
    }

    function retireCredits(
        uint256 projectId,
        uint256 amount,
        string memory uri
    ) public {
        _market.retireCredits(msg.sender, projectId, amount);

        _retirementIdCounter++;
        uint256 newTokenId = _retirementIdCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, uri);

        _createRetirementItem(newTokenId, projectId, amount);
        emit RetirementItemCreated(newTokenId, projectId, amount);
    }

    function getRetirementItem(
        uint256 tokenId
    ) public view returns (RetirementItem memory) {
        return _idToRetirementItem[tokenId];
    }

    function getOwnedRetirements()
        public
        view
        returns (RetirementItem[] memory)
    {
        uint256 ownedItemCount = ERC721.balanceOf(msg.sender);
        RetirementItem[] memory items = new RetirementItem[](ownedItemCount);

        for (uint256 i = 0; i < ownedItemCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            RetirementItem storage item = _idToRetirementItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    function getAllRetirements() public view returns (RetirementItem[] memory) {
        uint256 allItemsCount = _allRetirements.length;
        RetirementItem[] memory items = new RetirementItem[](allItemsCount);

        for (uint256 i = 0; i < allItemsCount; i++) {
            uint256 tokenId = tokenByIndex(i);
            RetirementItem storage item = _idToRetirementItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) public view returns (uint256) {
        require(index < ERC721.balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }

    function tokenByIndex(uint256 index) public view returns (uint256) {
        require(index < totalSupply(), "Index out of bounds");
        return _allRetirements[index];
    }

    function totalSupply() public view returns (uint256) {
        return _allRetirements.length;
    }

    function certificateRetirement(
        uint256 tokenId,
        string memory tokenUri
    ) public {
        _idToRetirementItem[tokenId].isCertificated = true;
        _setTokenURI(tokenId, tokenUri);
    }

    function _createRetirementItem(
        uint256 tokenId,
        uint256 projectId,
        uint256 amount
    ) private {
        _idToRetirementItem[tokenId] = RetirementItem({
            tokenId: tokenId,
            amount: amount,
            owner: msg.sender,
            projectId: projectId,
            timestamp: block.timestamp,
            isCertificated: false
        });

        // _addTokenToAllTokensEnumeration(tokenId);
        // _addTokenToOwnerEnumeration(msg.sender, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, amount);

        if (from == address(0)) {
            // mint
            _addTokenToAllTokensEnumeration(tokenId);
        }

        if (to != address(0)) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _idToRetirementIndex[tokenId] = _allRetirements.length;
        _allRetirements.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _idToOwnedIndex[tokenId] = length;
    }
}
