// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract CarbonBase is ERC1155URIStorage, ERC1155Burnable, Ownable {
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

    constructor() ERC1155("") {}

    function uri(
        uint256 tokenId
    ) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return super.uri(tokenId);
    }
}
