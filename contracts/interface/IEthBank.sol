// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IEthBank {
    event Deposit(
        address indexed sender,
        address indexed token,
        uint256 amount
    );
    event Withdraw(
        address indexed sender,
        address indexed token,
        uint256 amount
    );

    event EthBankTransfer(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount
    );
}
