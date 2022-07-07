//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.12;
import "../EthBank.sol";

contract ETHBankV2 is EthBank {
    function transferETH(
        address from,
        address to,
        uint256 amount
    ) external onlyValidAmount(amount) whenNotPaused {
        require(
            balances_[from][address(0)] >= amount,
            "ETHBANK: Not enough ETH"
        );
        balances_[from][address(0)] -= amount;
        balances_[to][address(0)] += amount;
        emit EthBankTransfer(from, to, address(0), amount);
    }

    function transferERC20(
        address from,
        address to,
        address token,
        uint256 amount
    ) external onlyValidAmount(amount) whenNotPaused {
        require(
            balances_[from][token] >= amount,
            "ETHBANK: Not enough ERC20 Token"
        );
        balances_[from][token] -= amount;
        balances_[to][token] += amount;
        emit EthBankTransfer(from, to, token, amount);
    }

    function transferToExternal(
        address from,
        address to,
        uint256 amount
    ) external onlyValidAmount(amount) whenNotPaused nonReentrant {
        require(
            balances_[from][address(0)] >= amount,
            "ETHBANK: Not enough ETH"
        );
        balances_[from][address(0)] -= amount;
        payable(address(to)).transfer(amount);
        emit EthBankTransfer(from, to, address(0), amount);
    }

    function transferERC20ToExternal(
        address from,
        address to,
        address token,
        uint256 amount
    ) external onlyValidAmount(amount) whenNotPaused nonReentrant {
        require(
            balances_[from][token] >= amount,
            "ETHBANK: Not enough ERC20 Token"
        );
        balances_[from][token] -= amount;
        IERC20Upgradeable _erc20Token = IERC20Upgradeable(token);
        require(_erc20Token.transfer(to, amount), "ETHBANK: Transfer failed");
        emit EthBankTransfer(from, to, token, amount);
    }

    function updateAdmin(address admin) external onlyAdmin {
        address currentAdmin = _getAdmin();
        addAdmin(admin);
        removeAdmin(currentAdmin);
    }
}
