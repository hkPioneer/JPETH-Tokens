// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Whitelistable.sol";

/**
 * @title JpEthStakingFundSp
 * @dev ERC20 Token for JpEthStakingFundSp
 */
contract JpEthStakingFundSp is Ownable, ERC20, Whitelistable {
    //using SafeMath for uint256;

    uint256 public constant TOTAL_SUPPLY_MAX = 500000;
    address public _manager;
    bool private _paused;
    uint8 private _decimals;

    event ManagerChanged(address indexed newManager);
    event ManagerRedeem(address indexed account, address indexed to, uint256 amount);
    event Pause();
    event Unpause();

    constructor(string memory name, string memory symbol, address manager, uint8 tokenDecimals) ERC20(name, symbol) {
        require(manager != address(0), "JPETHStakingFundSP: manager is the zero address");
        _manager = manager;
        _whitelister = manager;
        _decimals = tokenDecimals;
        _paused = true;
    }

    /**
     * @dev Throws if called by any account other than a manager
     */
    modifier onlyManager() {
        require(msg.sender == _manager, "JPETHStakingFundSP: caller is not the manager");
        _;
    }

    /**
     * @dev Throws if JPETHStakingFundSP transfer: paused
     */
    modifier whenNotPaused() {
        require(!_paused, "JPETHStakingFundSP transfer: paused");
        _;
    }

    /**
     * @notice Transfer tokens from the caller
     * @param to    Payee's address
     * @param amount Transfer amount
     * @return True if successful
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused() 
        inWhitelist(msg.sender)
        inWhitelist(to) 
        returns (bool) 
    {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @notice Transfer tokens by spending allowance
     * @param from  Payer's address
     * @param to    Payee's address
     * @param amount Transfer amount
     * @return True if successful
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused()
        inWhitelist(from)
        inWhitelist(to) 
        returns (bool) 
    {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    } 

    /**
     * @dev manager can redeem tokens from any address to its address
     * @param from someone's address
     * @param amount redeem amount
     * @return A boolean that indicates if the operation was successful.
     */
    function managerRedeem(address from, uint256 amount) external onlyManager returns (bool) {
        _transfer(from, _manager, amount);
        emit ManagerRedeem(from, _manager, amount);
        return true;
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint. Must be less than or equal to the total supply.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) external onlyManager returns (bool) {
        require(amount <= TOTAL_SUPPLY_MAX, "JPETHStakingFundSP: mint amount exceeds total supply");
        _mint(to, amount);
        return true;
    }

    /**
     * @dev allows a minter to burn some of its own tokens
     * @param amount uint256 the amount of tokens to be burned
     * @return A boolean that indicates if the operation was successful.
     */
    function burn(uint256 amount) external onlyManager returns (bool) {
        require(amount <= TOTAL_SUPPLY_MAX, "JPETHStakingFundSP: burn amount exceeds total supply");
        address owner = _msgSender();
        _burn(owner, amount);
        return true;
    }

    /**
     * @dev getManager address
     */
    function getManager() external view returns (address) {
        return _manager;
    }

    /**
     * @dev updateManager address by owner
     * @param newManager address
     */
    function updateManager(address newManager) external onlyOwner {
        require(newManager != address(0), "JPETHStakingFundSP: new manager is the zero address");
        _manager = newManager;
        emit ManagerChanged(_manager);
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev called by the manager to pause, triggers stopped state
     */
    function pause() public onlyManager {
        _paused = true;
        emit Pause();
    }

    /**
     * @dev called by the manager to unpause, returns to normal state
     */
    function unpause() public onlyManager {
        _paused = false;
        emit Unpause();
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
    */
   function decimals() public view virtual override returns (uint8) {
       return _decimals;
   }    

}