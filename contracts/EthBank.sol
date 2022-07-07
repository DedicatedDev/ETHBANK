//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.12;
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "./storage/EthBankStroage.sol";
import "./interface/IEthBank.sol";
import "hardhat/console.sol";

contract EthBank is UUPSUpgradeable, EthBankStroage, IEthBank {
    function initialize(address _admin) external initializer {
        __OwnablePausableUpgradeable_init(_admin);
    }

    function _authorizeUpgrade(address) internal virtual override onlyAdmin {}

    function depositETH()
        external
        payable
        onlyValidAmount(msg.value)
        whenNotPaused
    {
        _depositETH(msg.sender, msg.value);
        emit Deposit(msg.sender, address(0), msg.value);
    }

    function _depositETH(address owner, uint256 amount) private {
        balances_[owner][address(0)] += amount;
    }

    function depositERC20(address token, uint256 amount)
        external
        payable
        onlyValidAmount(amount)
        whenNotPaused
    {
        _depositToken(msg.sender, token, amount);
        emit Deposit(msg.sender, token, amount);
    }

    function _depositToken(
        address owner,
        address token,
        uint256 amount
    ) private {
        IERC20Upgradeable _erc20Token = IERC20Upgradeable(token);
        uint256 allowance = _erc20Token.allowance(owner, address(this));
        require(allowance >= amount, "ETHBANK: Not enough allowance");
        require(_erc20Token.transferFrom(msg.sender, address(this), amount));
        balances_[owner][token] += amount;
    }

    function withdraw(uint256 amount)
        external
        payable
        onlyValidAmount(amount)
        whenNotPaused
        nonReentrant
    {
        require(
            balances_[msg.sender][address(0)] >= amount,
            "ETHBANK: Not enough balance"
        );
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, address(0), amount);
    }

    function withdrawERC20(address token, uint256 amount)
        external
        onlyValidAmount(amount)
        whenNotPaused
        nonReentrant
    {
        require(
            balances_[msg.sender][token] >= amount,
            "ETHBANK: Not enough balance"
        );
        IERC20Upgradeable _erc20Token = IERC20Upgradeable(token);
        _erc20Token.approve(address(this), amount);
        _erc20Token.transferFrom(address(this), msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }

    function getBalanceOf(address owner, address token)
        external
        view
        returns (uint256)
    {
        return balances_[owner][token];
    }
}
