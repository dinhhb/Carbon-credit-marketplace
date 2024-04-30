// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ProjectManagement.sol";
import "./CarbonToken.sol";
import "./CarbonBase.sol";

contract CarbonMarket is CarbonBase {
    CarbonToken private _token;
    uint256 private _listedTokens; // number of listed credits

    constructor(address _tokenAddress) {
        _token = CarbonToken(_tokenAddress);
    }

    function getListedTokensCount() public view returns (uint256) {
        // returns the total number of listed credits
        return _listedTokens;
    }

    function listCreditsForSale(uint256 tokenId, uint256 price) public {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(
            _token.balanceOf(msg.sender, tokenId) > 0,
            "You must own the token to list it."
        );
        require(
            msg.sender == credit.initialOwner,
            "Only the initial owner can list the credits for sale."
        );
        require(
            credit.status == ApprovalStatus.Approved,
            "Credits must be approved before listing."
        );
        require(!credit.isListed, "Already listed.");
        require(price > 0, "Price must be greater than zero.");
        reu
        require(
            _token.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not authorized to manage this token."
        );

        _token.updateListed(tokenId, true);
        _token.updatePrice(tokenId, price);
        _listedTokens += 1;

        emit CarbonCreditListed(
            tokenId,
            credit.initialOwner,
            ApprovalStatus.Approved,
            price,
            true
        );
    }

    function getAllListedCredits() public view returns (CarbonCredit[] memory) {
        // [{}, {}, ...]
        uint allCreditsCount = _token.getTotalTokensCount();
        uint currentIndex = 0;
        CarbonCredit[] memory credits = new CarbonCredit[](_listedTokens);

        for (uint i = 0; i < allCreditsCount; i++) {
            uint tokenId = _token.getTokenByIndex(i);
            CarbonCredit memory credit = _token.getCarbonCredit(tokenId);
            if (credit.isListed == true) {
                credits[currentIndex] = credit;
                currentIndex += 1;
            }
        }
        return credits;
    }

    function buyCredits(uint256 tokenId, uint256 amount) public payable {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(
            credit.isListed,
            "Token must be listed for sale before it can be purchased."
        );
        require(
            _token.balanceOf(credit.initialOwner, tokenId) >= amount,
            "Insufficient balance to purchase."
        );
        require(
            msg.value >= credit.pricePerCredit * amount,
            "Insufficient funds to purchase."
        );
        require(
            _token.isApprovedForAll(credit.initialOwner, address(this)),
            "Marketplace not authorized by token owner."
        );

        _token.safeTransferFrom(
            credit.initialOwner,
            msg.sender,
            tokenId,
            amount,
            ""
        );
        payable(credit.initialOwner).transfer(msg.value);

        _token.updateTokenSold(tokenId, amount);

        // Additional custom logic post-transfer
        // If all tokens of this ID are transferred, update the CarbonCredit struct
        if (_token.balanceOf(credit.initialOwner, tokenId) == 0) {
            _token.updateListed(tokenId, false);
            _listedTokens--;
        }

        emit TokenTransferred(tokenId, credit.initialOwner, msg.sender, amount);
    }

    function retireCredits(uint256 tokenId, uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero.");
        require(
            _token.balanceOf(msg.sender, tokenId) >= amount,
            "Insufficient token balance to retire."
        );
        // require(msg.sender != address(0), "Invalid address.");
        // require(
        //     _idToTokenSupply[tokenId] >= amount,
        //     "Burn amount exceeds supply"
        // );

        _token.burn(msg.sender, tokenId, amount);
    }

    function getTokenAddress() public view returns (address) {
        return address(_token);
    }
}
