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
        _token.mint(msg.sender, currentId, tokenSupply, "");
        _token.setURI(currentId);
        emit CarbonCreditCreated(
            currentId,
            msg.sender,
            ApprovalStatus.Pending,
            0,
            false
        );
    }

    function approveProject(uint256 tokenId) public payable onlyOwner {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(
            credit.status == ApprovalStatus.Pending,
            "Project cannot be approved"
        );

        _token.updateStatus(tokenId, ApprovalStatus.Approved);
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
