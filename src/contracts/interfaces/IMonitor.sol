// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMonitor {
    function checkTransaction(
        address wallet,
        uint256 amount
    ) external returns (bool);
}