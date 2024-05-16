// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./CarbonBase.sol";

contract CarbonToken is CarbonBase {
    uint256[] private _allTokenIds; // array of all token IDs
    // uint256 public tokenIds;
    // mapping(uint256 => CarbonCredit) public _idToCarbonCredit;
    mapping(uint256 => uint256) private _idToTokenSupply; // mapping of token ID => total supply of token
    mapping(uint256 => uint256) private _idToTokensIndex; // mapping of token ID => index of token in all tokens array
    mapping(address => uint256[]) private _ownerToTokenIds; // mapping of owner => list of token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokensIndex; // Mapping from token ID to index in the above array
    mapping(uint256 => CarbonCredit) private _idToCarbonCredit;
    mapping(uint256 => address[]) private _tokenOwners;
    mapping(uint256 => uint256) private _ownerCount;
    mapping(uint256 => uint256) private _tokenSold;

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(account, id, amount, data);
    }

    function setURI(uint256 tokenId, string memory newURI) public {
        _setURI(tokenId, newURI);
    }

    function getTokenSold(uint256 tokenId) public view returns (uint256) {
        return _tokenSold[tokenId];
    }

    function updateTokenSold(uint256 tokenId, uint256 amount) public {
        _tokenSold[tokenId] += amount;
    }

    function getTotalTokensCount() public view returns (uint256) {
        // returns the total number of credits
        return _allTokenIds.length;
    }

    function getTokenByIndex(uint256 index) public view returns (uint256) {
        require(index < getTotalTokensCount(), "Index out of bounds.");
        return _allTokenIds[index];
    }

    function getCarbonCredit(
        uint256 tokenId
    ) public view returns (CarbonCredit memory) {
        return _idToCarbonCredit[tokenId];
    }

    function setCarbonCredit(
        uint256 tokenId,
        address owner,
        ApprovalStatus status,
        uint256 pricePerCredit,
        bool isListed
    ) public {
        _idToCarbonCredit[tokenId] = CarbonCredit(
            tokenId,
            owner,
            status,
            pricePerCredit,
            isListed
        );
    }

    function updateStatus(uint256 tokenId, ApprovalStatus status) public {
        _idToCarbonCredit[tokenId].status = status;
    }

    function updatePrice(uint256 tokenId, uint256 price) public {
        _idToCarbonCredit[tokenId].pricePerCredit = price;
    }

    function updateListed(uint256 tokenId, bool isListed) public {
        _idToCarbonCredit[tokenId].isListed = isListed;
    }

    function getTokenSupply(uint256 tokenId) public view returns (uint256) {
        return _idToTokenSupply[tokenId];
    }

    function getOwnedTokensCount(address owner) public view returns (uint256) {
        return _ownerToTokenIds[owner].length;
    }

    function getOwnerTokenByIndex(
        address owner,
        uint256 index
    ) public view returns (uint256) {
        // require(
        //     index < balanceOf(owner, getTokenByIndex(index)),
        //     "Index out of bounds."
        // );
        return _ownerToTokenIds[owner][index];
    }

    function getAllCredits() public view returns (CarbonCredit[] memory) {
        CarbonCredit[] memory credits = new CarbonCredit[](_allTokenIds.length);
        for (uint i = 0; i < _allTokenIds.length; i++) {
            uint tokenId = getTokenByIndex(i);
            CarbonCredit storage credit = _idToCarbonCredit[tokenId];
            credits[i] = credit;
        }
        return credits;
    }

    function getOwnedCredits() public view returns (CarbonCredit[] memory) {
        uint256 ownedCreditsCount = getOwnedTokensCount(msg.sender);
        CarbonCredit[] memory credits = new CarbonCredit[](ownedCreditsCount);

        for (uint i = 0; i < ownedCreditsCount; i++) {
            uint tokenId = getOwnerTokenByIndex(msg.sender, i);
            CarbonCredit storage credit = _idToCarbonCredit[tokenId];
            credits[i] = credit;
        }
        return credits;
    }

    function getTokenOwners(
        uint256 tokenId
    ) public view returns (address[] memory) {
        return _tokenOwners[tokenId];
    }

    function getOwnerCount(uint256 tokenId) public view returns (uint256) {
        return _ownerCount[tokenId];
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            if (from == address(0)) {
                // This implies the token is being minted
                _addTokenToAllTokensEnumeration(tokenId);
                _idToTokenSupply[tokenId] = amounts[i];
            }
            if (from != address(0) && balanceOf(from, tokenId) == amounts[i]) {
                // checking before transfer
                // This implies the sender is transferring all their units of this token type
                _removeTokenFromOwnerEnumeration(from, tokenId);
                _removeTokenOwner(tokenId, from);
            }
            if (to != address(0) && balanceOf(to, tokenId) == 0) {
                // identify the first time tokens are transferred to a new holder.
                // This implies the recipient did not previously own any units of this token type
                _addTokenToOwnerEnumeration(to, tokenId);
                _addTokenOwner(tokenId, to);
            } else if (to == address(0)) {
                // checking before burn
                _idToTokenSupply[tokenId] -= amounts[i];
                if (_idToTokenSupply[tokenId] == 0) {
                    // This implies the recipient is burning all units of a token are burned
                    _removeTokenFromAllTokensEnumeration(ids[i]);
                }
            }
        }
    }

    function _removeTokenOwner(uint256 tokenId, address owner) private {
        require(_ownerCount[tokenId] > 0, "No owners to remove.");
        uint256 length = _tokenOwners[tokenId].length;
        for (uint256 i = 0; i < length; i++) {
            if (_tokenOwners[tokenId][i] == owner) {
                _tokenOwners[tokenId][i] = _tokenOwners[tokenId][length - 1];
                _tokenOwners[tokenId].pop();
                _ownerCount[tokenId]--;
                break;
            }
        }
    }

    function _isOwner(
        uint256 tokenId,
        address owner
    ) private view returns (bool) {
        for (uint256 i = 0; i < _tokenOwners[tokenId].length; i++) {
            if (_tokenOwners[tokenId][i] == owner) {
                return true;
            }
        }
        return false;
    }

    function _addTokenOwner(uint256 tokenId, address owner) private {
        if (!_isOwner(tokenId, owner)) {
            _tokenOwners[tokenId].push(owner);
            _ownerCount[tokenId]++;
        }
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _idToTokensIndex[tokenId] = _allTokenIds.length;
        _allTokenIds.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        if (balanceOf(to, tokenId) == 0) {
            // Token ID is new to this owner
            _ownerToTokenIds[to].push(tokenId);
        }
    }

    function _removeTokenFromOwnerEnumeration(
        address owner,
        uint256 tokenId
    ) private {
        // First, we need to find the index of this token ID in the owner's list of token IDs
        uint256 lastTokenIndex = _ownerToTokenIds[owner].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[owner][tokenId];

        // If the token being removed is not the last token in the list,
        // swap the last token with the token to be removed.
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownerToTokenIds[owner][lastTokenIndex];

            _ownerToTokenIds[owner][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-be-removed token
            _ownedTokensIndex[owner][lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // Remove the last token's data (since it's now either removed or moved)
        _ownerToTokenIds[owner].pop();
        delete _ownedTokensIndex[owner][tokenId]; // Remove the deleted token's index
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        uint256 lastTokenIndex = _allTokenIds.length - 1;
        uint256 tokenIndex = _idToTokensIndex[tokenId];
        uint256 lastTokenId = _allTokenIds[lastTokenIndex];

        _allTokenIds[tokenIndex] = lastTokenId; // Move the last token to the slot of the to-be-removed token
        _idToTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index

        // Remove the last token's data (since it's now either removed or moved)
        _allTokenIds.pop();
        delete _idToTokensIndex[tokenId]; // Remove the deleted token's index
    }
}
