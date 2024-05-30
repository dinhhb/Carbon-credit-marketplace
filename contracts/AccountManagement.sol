// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./CarbonToken.sol";
import "./CarbonMarket.sol";
import "./CarbonBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AccountManagement is Ownable, CarbonBase {
    CarbonToken private _token;
    uint256[] private _accountIds;
    address private authorizedContract;

    mapping(uint256 => Account) private _idToAccount;

    struct Account {
        address addr;
        uint256 totalCredits;
        uint256 totalRetire;
        bool isAuditor;
        uint256 registeredAt;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == authorizedContract || msg.sender == owner(),
            "Caller is not authorized"
        );
        _;
    }

    constructor(address _tokenAddress) {
        _token = CarbonToken(_tokenAddress);
    }

    function setAuthorizedContract(
        address _authorizedContract
    ) external onlyOwner {
        authorizedContract = _authorizedContract;
    }

    function checkAccountRegistered(address account) public view returns (bool) {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage acc = _idToAccount[accountId];
            if (acc.addr == account) {
                return true; // Account already exists
            }
        }
        return false;
    }

    function getAccountTotalCredits(
        address account
    ) public view returns (uint256) {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage acc = _idToAccount[accountId];
            if (acc.addr == account) {
                return acc.totalCredits;
            }
        }
        return 0;
    }

    function setAccountTotalCredits(
        address account,
        uint256 totalCredits
    ) public onlyAuthorized {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage acc = _idToAccount[accountId];
            if (acc.addr == account) {
                acc.totalCredits = totalCredits;
                break;
            }
        }
    }

    function getAccountTotalRetire(
        address account
    ) public view returns (uint256) {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage acc = _idToAccount[accountId];
            if (acc.addr == account) {
                return acc.totalRetire;
            }
        }
        return 0;
    }

    function setAccountTotalRetire(
        address account,
        uint256 totalRetire
    ) public onlyAuthorized {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage acc = _idToAccount[accountId];
            if (acc.addr == account) {
                acc.totalRetire = totalRetire;
                break;
            }
        }
    }

    function getAccountIdsCount() public view returns (uint256) {
        return _accountIds.length;
    }

    function isAuditor(address auditor) public view returns (bool) {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage account = _idToAccount[accountId];
            if (account.addr == auditor && account.isAuditor) {
                return true;
            }
        }
        return false;
    }

    function getAccountByIndex(uint256 index) public view returns (uint256) {
        require(index < getAccountIdsCount(), "Index OFB");
        return _accountIds[index];
    }

    function getAccountByAddress(
        address account
    ) public view returns (Account memory) {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage acc = _idToAccount[accountId];
            if (acc.addr == account) {
                return acc;
            }
        }
        revert("Account not found");
    }

    function getAllAccounts() public view returns (Account[] memory) {
        Account[] memory accounts = new Account[](_accountIds.length);
        for (uint i = 0; i < _accountIds.length; i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage account = _idToAccount[accountId];
            accounts[i] = account;
        }
        return accounts;
    }

    // function getAuditorsCount() public view returns (uint256) {
    //     uint count = 0;
    //     for (uint i = 0; i < _accountIds.length; i++) {
    //         uint256 accountId = getAccountByIndex(i);
    //         Account storage account = _idToAccount[accountId];
    //         if (account.isAuditor) {
    //             count += 1;
    //         }
    //     }
    //     return count;
    // }

    // function getAllAuditors() public view returns (Account[] memory) {
    //     Account[] memory auditors = new Account[](getAuditorsCount());
    //     uint currentIndex = 0;
    //     for (uint i = 0; i < _accountIds.length; i++) {
    //         uint256 accountId = getAccountByIndex(i);
    //         Account storage account = _idToAccount[accountId];
    //         if (account.isAuditor) {
    //             auditors[currentIndex] = account;
    //             currentIndex += 1;
    //         }
    //     }
    //     return auditors;
    // }

    function registerAccount(
        address account,
        uint256 totalCredits,
        bool isAudit
    ) public onlyOwner {
        uint currentId = _accountIds.length;
        _idToAccount[currentId] = Account(
            account,
            totalCredits,
            0,
            isAudit,
            block.timestamp
        );
        _accountIds.push(currentId);
    }

    function removeAccount(address addr) public onlyOwner {
        for (uint i = 0; i < getAccountIdsCount(); i++) {
            uint256 accountId = getAccountByIndex(i);
            Account storage account = _idToAccount[accountId];
            if (account.addr == addr) {
                delete _idToAccount[accountId];
                _accountIds[i] = _accountIds[_accountIds.length - 1];
                _accountIds.pop();
                break;
            }
        }
    }
}
