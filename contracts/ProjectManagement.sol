// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./CarbonToken.sol";
import "./CarbonBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectManagement is Ownable, CarbonBase {
    CarbonToken private _token;
    uint256 private _tokenIds;

    constructor(address _tokenAddress) {
        _token = CarbonToken(_tokenAddress);
    }

    function registerProject(uint256 tokenSupply) public {
        uint256 currentId = ++_tokenIds; // tokenID starts from 1

        _token.setCarbonCredit(
            currentId,
            msg.sender,
            ApprovalStatus.Pending,
            0,
            false
        );

        _token.setTokenSupply(currentId, tokenSupply);
        _token.getAddTokenToAllTokensEnumeration(currentId);
    }

    function approveProject(uint256 tokenId) public payable onlyOwner {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(
            credit.status == ApprovalStatus.Pending,
            "Project cannot be approved"
        );

        _token.updateStatus(tokenId, ApprovalStatus.Approved);
        _token.mint(credit.initialOwner, tokenId, _token.getTokenSupply(tokenId), "");
        _token.setURI(tokenId);

        emit CarbonCreditCreated(
            tokenId,
            credit.initialOwner,
            ApprovalStatus.Approved,
            0,
            false
        );
    }

    function declineProject(uint256 tokenId) public onlyOwner {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(
            credit.status == ApprovalStatus.Pending,
            "Project cannot be declined"
        );
        _token.updateStatus(tokenId, ApprovalStatus.Declined);
        _token.setURI(tokenId);
    }

    function getTokenAddress() public view returns (address) {
        return address(_token);
    }
}
