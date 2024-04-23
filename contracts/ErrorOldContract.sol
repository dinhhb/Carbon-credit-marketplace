// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CarbonMarket is ERC1155URIStorage, ERC1155Burnable, Ownable {
    enum ApprovalStatus {
        Pending,
        Approved,
        Declined
    }

    struct CarbonCredit {
        uint256 tokenId;
        address initialOwner;
        ApprovalStatus status;
        uint256 pricePerCredit;
        bool isListed;
    }

    event CarbonCreditCreated(
        uint256 tokenId,
        address initialOwner,
        ApprovalStatus status,
        uint256 pricePerCredit,
        bool isListed
    );

    event CarbonCreditListed(
        uint256 tokenId,
        address initialOwner,
        ApprovalStatus status,
        uint256 pricePerCredit,
        bool isListed
    );

    event TokenTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    uint256 private _tokenIds;
    uint256 private _listedTokens; // number of listed credits
    uint256[] private _allTokenIds; // array of all token IDs
    mapping(uint256 => CarbonCredit) public idToCarbonCredit;
    mapping(uint256 => uint256) private _idToTokenSupply; // mapping of token ID => total supply of token
    mapping(uint256 => uint256) private _idToTokensIndex; // mapping of token ID => index of token in all tokens array
    mapping(address => uint256[]) private _ownerToTokenIds; // mapping of owner => list of token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokensIndex; // Mapping from token ID to index in the above array

    constructor()
        ERC1155(
            "https://ipfs.io/ipfs/QmRaNxZouFunnDnds57VGmtrtA2EBEFLeszaXAo8GZfZ8e/{id}.json"
        )
    {}

    // function uri(
    //     uint256 tokenId
    // ) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
    //     return ERC1155URIStorage.uri(tokenId);
    // }

    function uri(
        uint256 tokenId
    ) public pure override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://gateway.pinata.cloud/ipfs/QmRaNxZouFunnDnds57VGmtrtA2EBEFLeszaXAo8GZfZ8e/",
                    Strings.toString(tokenId),
                    ".json"
                )
            );
    }

    function getCreditItem(
        uint256 tokenId
    ) public view returns (CarbonCredit memory) {
        return idToCarbonCredit[tokenId];
    }

    function getListedTokensCount() public view returns (uint256) {
        // returns the total number of listed credits
        return _listedTokens;
    }

    function getTotalTokensCount() public view returns (uint256) {
        // returns the total number of credits
        return _allTokenIds.length;
    }

    function getTokenByIndex(uint256 index) public view returns (uint256) {
        require(index < getTotalTokensCount(), "Index out of bounds.");
        return _allTokenIds[index];
    }

    function getOwnedTokensCount(address owner) public view returns (uint256) {
        return _ownerToTokenIds[owner].length;
    }

    function getOwnerTokenByIndex(
        address owner,
        uint256 index
    ) public view returns (uint256) {
        require(
            index < balanceOf(owner, getTokenByIndex(index)),
            "Index out of bounds."
        );
        return _ownerToTokenIds[owner][index];
    }

    function getTokenSupply(uint256 tokenId) public view returns (uint256) {
        return _idToTokenSupply[tokenId];
    }

    // Allows user to register a project
    function registerProject(uint256 tokenSupply) public {
        uint256 currentId = ++_tokenIds; // tokenID starts from 1
        idToCarbonCredit[currentId] = CarbonCredit(
            currentId,
            msg.sender,
            ApprovalStatus.Pending,
            0,
            false
        );
        _idToTokenSupply[currentId] = tokenSupply;
        _addTokenToAllTokensEnumeration(currentId);
    }

    function approveProject(uint256 tokenId) public payable onlyOwner {
        require(
            idToCarbonCredit[tokenId].status == ApprovalStatus.Pending,
            "Project cannot be approved as it is not pending."
        );
        idToCarbonCredit[tokenId].status = ApprovalStatus.Approved;
        _mint(
            idToCarbonCredit[tokenId].initialOwner,
            tokenId,
            _idToTokenSupply[tokenId],
            ""
        );
        _setURI(tokenId, uri(tokenId));
        emit CarbonCreditCreated(
            tokenId,
            idToCarbonCredit[tokenId].initialOwner,
            ApprovalStatus.Approved,
            0,
            false
        );
    }

    function declineProject(uint256 tokenId) public onlyOwner {
        require(
            idToCarbonCredit[tokenId].status == ApprovalStatus.Pending,
            "Project cannot be declined"
        );
        idToCarbonCredit[tokenId].status = ApprovalStatus.Declined;
        _setURI(tokenId, uri(tokenId));
    }

    function listCreditsForSale(uint256 tokenId, uint256 price) public payable {
        require(
            msg.sender == idToCarbonCredit[tokenId].initialOwner,
            "Only the initial owner can list the credits for sale."
        );
        require(
            idToCarbonCredit[tokenId].status == ApprovalStatus.Approved,
            "The credits must be approved before it can be listed for sale."
        );
        require(
            !idToCarbonCredit[tokenId].isListed,
            "The credits is already listed for sale."
        );
        require(price > 0, "The price per credit must be greater than zero.");

        // Set the token as listed and update the price
        idToCarbonCredit[tokenId].isListed = true;
        _listedTokens++;
        idToCarbonCredit[tokenId].pricePerCredit = price;
        emit CarbonCreditListed(
            tokenId,
            idToCarbonCredit[tokenId].initialOwner,
            ApprovalStatus.Approved,
            price,
            true
        );
    }

    function getAllListedCredits() public view returns (CarbonCredit[] memory) {
        // [{}, {}, ...]
        uint allCreditsCount = getTotalTokensCount();
        uint currentIndex = 0;
        CarbonCredit[] memory credits = new CarbonCredit[](_listedTokens);

        for (uint i = 0; i < allCreditsCount; i++) {
            uint tokenId = getTokenByIndex(i);
            CarbonCredit storage credit = idToCarbonCredit[tokenId];
            if (credit.isListed == true) {
                credits[currentIndex] = credit;
                currentIndex += 1;
            }
        }
        return credits;
    }

    function getOwnedCredits() public view returns (CarbonCredit[] memory) {
        uint256 ownedCreditsCount = getOwnedTokensCount(msg.sender);
        CarbonCredit[] memory credits = new CarbonCredit[](ownedCreditsCount);

        for (uint i = 0; i < ownedCreditsCount; i++) {
            uint tokenId = getOwnerTokenByIndex(msg.sender, i);
            CarbonCredit storage credit = idToCarbonCredit[tokenId];
            credits[i] = credit;
        }
        return credits;
    }

    function buyCredits(uint256 tokenId, uint256 amount) public payable {
        CarbonCredit storage credit = idToCarbonCredit[tokenId];

        require(
            credit.isListed,
            "Token must be listed for sale before it can be purchased."
        );
        require(
            balanceOf(credit.initialOwner, tokenId) >= amount,
            "Insufficient balance to purchase."
        );
        require(
            msg.value >= credit.pricePerCredit * amount,
            "Insufficient funds to purchase."
        );

        _safeTransferFrom(credit.initialOwner, msg.sender, tokenId, amount, "");
        payable(credit.initialOwner).transfer(msg.value);

        // Additional custom logic post-transfer
        // If all tokens of this ID are transferred, update the CarbonCredit struct
        if (balanceOf(credit.initialOwner, tokenId) == 0) {
            credit.isListed = false;
            _listedTokens--;
        }

        emit TokenTransferred(tokenId, credit.initialOwner, msg.sender, amount);
    }

    function retireCredits(uint256 tokenId, uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero.");
        require(
            balanceOf(msg.sender, tokenId) >= amount,
            "Insufficient token balance to retire."
        );
        require(msg.sender != address(0), "Invalid address.");

        // Call the burn function inherited from ERC1155Burnable
        burn(msg.sender, tokenId, amount);

        // Emit an event or additional logic if needed
        // Example: Emitting an event (uncomment the next line if you decide to implement the event)
        // emit CreditsRetired(msg.sender, tokenId, amount);
    }

    // Optional: Define an event for retiring credits
    // event CreditsRetired(address indexed account, uint256 indexed tokenId, uint256 amount);

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
            if (from != address(0) && balanceOf(from, ids[i]) == amounts[i]) {
                // checking before transfer
                // ids[i] is the token ID
                // This implies the sender is transferring all their units of this token type
                _removeTokenFromOwnerEnumeration(from, ids[i]);
            }
            if (to != address(0) && balanceOf(to, ids[i]) == 0) {
                // checking before mint
                // This implies the recipient did not previously own any units of this token type
                _addTokenToOwnerEnumeration(to, ids[i]);
            } else if (to == address(0)) {
                require(
                    _idToTokenSupply[ids[i]] >= amounts[i],
                    "Burn amount exceeds supply"
                );
                // checking before burn
                _idToTokenSupply[ids[i]] -= amounts[i]; // Decrease the supply of the burned tokens
                if (_idToTokenSupply[ids[i]] == 0) {
                    // If all tokens of this ID are burned, remove the token from all tokens array
                    _removeTokenFromAllTokensEnumeration(ids[i]);
                }
            }
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
