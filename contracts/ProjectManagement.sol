// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./CarbonToken.sol";
import "./CarbonMarket.sol";
import "./CarbonBase.sol";
import "./AccountManagement.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectManagement is Ownable, CarbonBase {
    CarbonToken private _token;
    CarbonMarket private _market;
    AccountManagement private _account;
    uint256 private _tokenIds;

    constructor(
        address _tokenAddress,
        address _accountAddress,
        address _marketAddress
    ) {
        _token = CarbonToken(_tokenAddress);
        _account = AccountManagement(_accountAddress);
        _market = CarbonMarket(_marketAddress);
    }

    modifier onlyAuditor() {
        require(_account.isAuditor(msg.sender), "Invalid auditor");
        _;
    }

    function registerProject(
        uint256 tokenSupply,
        string memory tokenURI,
        uint256 price
    ) public {
        require(
            tokenSupply <= _account.getAccountTotalCredits(msg.sender),
            "Token supply invalid"
        );
        require(price > 0, "Invalid price");
        uint256 currentId = ++_tokenIds; // tokenID starts from 1
        _token.setCarbonCredit(
            currentId,
            msg.sender,
            ApprovalStatus.Pending,
            price,
            false
        );
        _token.setTokenSupply(currentId, tokenSupply);
        _token.setURI(currentId, tokenURI);
        _token.getAddTokenToAllTokensEnumeration(currentId);
    }

    function approveProject(uint256 tokenId) public payable onlyAuditor {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(credit.status == ApprovalStatus.Pending, "Invalid status");

        _token.updateStatus(tokenId, ApprovalStatus.Approved);
        _token.mint(
            credit.initialOwner,
            tokenId,
            _token.getTokenSupply(tokenId),
            ""
        );

        emit CarbonCreditCreated(
            tokenId,
            msg.sender,
            _token.getTokenSupply(tokenId),
            block.timestamp
        );
        emit CarbonCreditAudited(
            tokenId,
            msg.sender,
            credit.initialOwner,
            ApprovalStatus.Approved,
            block.timestamp
        );

        _market.listCreditsForSale(tokenId, credit.pricePerCredit);
    }

    function declineProject(uint256 tokenId) public onlyAuditor {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(credit.status == ApprovalStatus.Pending, "Invalid status");
        _token.updateStatus(tokenId, ApprovalStatus.Declined);
        emit CarbonCreditAudited(
            tokenId,
            msg.sender,
            credit.initialOwner,
            ApprovalStatus.Declined,
            block.timestamp
        );
    }
}
