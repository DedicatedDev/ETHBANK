//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.12;
import "../presets/OwnablePausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

abstract contract EthBankStroage is
    OwnablePausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    mapping(address => mapping(address => uint256)) internal balances_;
    uint256 internal fee_;

    modifier onlyValidAmount(uint256 amount) {
        require(amount > 0, "ETHBANK: Amount must be greater than 0");
        _;
    }
}
