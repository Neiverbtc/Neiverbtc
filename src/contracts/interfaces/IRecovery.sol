// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRecovery {
    function initiateRecovery(address wallet) external;
    function approveRecovery(address wallet) external;
}