// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./AccountManagement.sol";
import "./CarbonToken.sol";
import "./CarbonBase.sol";

contract CarbonMarket is CarbonBase {
    CarbonToken private _token;
    AccountManagement private _account;
    uint256 private _listedTokens; // number of listed credits

    event Log(string message, uint256 value);

    constructor(address _tokenAddress, address _accountAddress) {
        _token = CarbonToken(_tokenAddress);
        _account = AccountManagement(_accountAddress);
    }

    function _validateCarbonCredit(
        uint256 tokenId,
        address owner,
        bool checkListed,
        bool checkDelisted
    ) internal view {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        require(_token.balanceOf(owner, tokenId) > 0, "Invalid token balance");
        require(credit.status == ApprovalStatus.Approved, "Invalid status");
        require(
            _token.isApprovedForAll(owner, address(this)),
            "Marketplace not yet authorized"
        );

        if (checkListed) {
            require(!credit.isListed, "Already listed.");
        }

        if (checkDelisted) {
            require(credit.isListed, "Not listed.");
        }
    }

    function getListedTokensCount() public view returns (uint256) {
        // returns the total number of listed credits
        return _listedTokens;
    }

    function listCreditsForSale(uint256 tokenId, uint256 price) public {
        CarbonCredit memory credit = _token.getCarbonCredit(tokenId);

        _validateCarbonCredit(tokenId, credit.initialOwner, true, false);
        require(price > 0, "Invalid price");

        _token.updateListed(tokenId, true);
        _token.updatePrice(tokenId, price);
        _listedTokens += 1;

        emit CarbonCreditListed(
            tokenId,
            credit.initialOwner,
            _token.getTokenSupply(tokenId),
            price,
            block.timestamp
        );
    }

    function delistCredits(uint256 tokenId) public {
        _validateCarbonCredit(tokenId, msg.sender, false, true);

        _token.updateListed(tokenId, false);
        _listedTokens -= 1;
    }

    function changePrice(uint256 tokenId, uint256 price) public {
        _validateCarbonCredit(tokenId, msg.sender, false, true);
        require(price > 0, "Invalid price");

        _token.updatePrice(tokenId, price);
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
            _account.checkAccountRegistered(msg.sender),
            "Account not registered."
        );
        require(credit.isListed, "Invalid isListed status.");
        require(
            _token.balanceOf(credit.initialOwner, tokenId) >= amount,
            "Insufficient balance."
        );
        require(
            msg.value >= credit.pricePerCredit * amount,
            "Insufficient funds."
        );
        require(
            _token.isApprovedForAll(credit.initialOwner, address(this)),
            "Marketplace not yet authorized."
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

        // Update account total credits
        _account.setAccountTotalCredits(
            credit.initialOwner,
            _account.getAccountTotalCredits(credit.initialOwner) - amount
        );
        _account.setAccountTotalCredits(
            msg.sender,
            _account.getAccountTotalCredits(msg.sender) + amount
        );

        emit CarbonCreditPurchased(
            tokenId,
            credit.initialOwner,
            msg.sender,
            amount,
            block.timestamp
        );
    }

    function retireCredits(address caller, uint256 tokenId, uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero.");
        require(
            _account.checkAccountRegistered(caller),
            "Account not registered."
        );

        require(
            _token.balanceOf(caller, tokenId) >= amount,
            "Insufficient balance."
        );
        require(
            _token.isApprovedForAll(caller, address(this)),
            "Marketplace not yet authorized."
        );

        _token.burn(caller, tokenId, amount);

        uint256 currentTotalCredits = _account.getAccountTotalCredits(
            caller
        );
        uint256 currentTotalRetire = _account.getAccountTotalRetire(caller);

        emit Log("Current Total Credits", currentTotalCredits);
        emit Log("Current Total Retire", currentTotalRetire);

        require(currentTotalCredits >= amount, "Underflow detected.");

        _account.setAccountTotalCredits(
            caller,
            currentTotalCredits - amount
        );
        _account.setAccountTotalRetire(caller, currentTotalRetire + amount);

        emit CarbonCreditRetired(tokenId, caller, amount, block.timestamp);
    }
}
