//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Whitelistable Token
 * @dev Allows accounts to be Whitelisted by a "Whitelister" role
 */
contract Whitelistable is Ownable {
    address public _whitelister;
    mapping(address => bool) internal _whitelisted;

    event Whitelisted(address indexed account);
    event UnWhitelisted(address indexed account);
    event WhitelisterChanged(address indexed newWhitelister);

    constructor(address whitelister) {
        updateWhitelister(whitelister);
    }

    /**
     * @dev Throws if called by any account other than the whitelister
     */
    modifier onlyWhitelister() {
        require(
            msg.sender == _whitelister,
            "Whitelistable: caller is not the whitelister"
        );
        _;
    }

    /**
     * @dev Throws if argument account is not whitelisted
     * @param account The address to check
     */
    modifier inWhitelist(address account) {
        require(
            _whitelisted[account],
            "inWhitelist: account is not whitelisted"
        );
        _;
    }

    /**
     * @dev Returns the address of the current whitelister
     */
    function getWhitelister() external view returns (address) {
        return _whitelister;
    }

    /**
     * @dev Checks if account is whitelisted
     * @param account The address to check
     */
    function isWhitelisted(address account) external view returns (bool) {
        return _whitelisted[account];
    }

    /**
     * @dev Adds account to whitelist
     * @param account The address to whitelist
     */
    function addWhitelist(address account) public onlyWhitelister {
        _whitelisted[account] = true;
        emit Whitelisted(account);
    }

    /**
     * @dev Adds accounts to whitelist
     * @param accounts batch of addresses to whitelist
     */
    function addBatchToWhitelist(address[] memory accounts) public onlyWhitelister {
        for(uint i = 0; i < accounts.length; i++){
            require(accounts[i] != address(0), "Whitelistable: account is the zero address");
            require(!_whitelisted[accounts[i]], "Whitelistable: account is already whitelisted");
            _whitelisted[accounts[i]] = true;
            emit Whitelisted(accounts[i]);
        }
    }

    /**
     * @dev Removes account from whitelist
     * @param account The address to remove from the whitelist
     */
    function unWhitelist(address account) external onlyWhitelister {
        _whitelisted[account] = false;
        emit UnWhitelisted(account);
    }

    function updateWhitelister(address newWhitelister) public onlyOwner{
        require(
            newWhitelister != address(0),
            "Whitelistable: new whitelister is the zero address"
        );
        _whitelister = newWhitelister;
        emit WhitelisterChanged(_whitelister);
    }
}

