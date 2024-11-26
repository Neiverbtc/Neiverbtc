// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRecovery.sol";

/**
 * @title Recovery
 * @dev Handles wallet recovery through multisig or digital identity
 */
contract Recovery is IRecovery, ReentrancyGuard, Ownable {
    struct RecoveryRequest {
        address initiator;
        uint256 threshold;
        mapping(address => bool) hasApproved;
        uint256 approvals;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(address => RecoveryRequest) public recoveryRequests;
    uint256 public constant RECOVERY_TIMEOUT = 7 days;
    
    event RecoveryInitiated(address indexed wallet, address indexed initiator);
    event RecoveryApproved(address indexed wallet, address indexed guardian);
    event RecoveryCompleted(address indexed wallet);
    
    constructor() Ownable(msg.sender) {}
    
    function initiateRecovery(address _wallet) external override {
        require(!recoveryRequests[_wallet].isActive, "Recovery already in progress");
        
        RecoveryRequest storage request = recoveryRequests[_wallet];
        request.initiator = msg.sender;
        request.timestamp = block.timestamp;
        request.isActive = true;
        
        emit RecoveryInitiated(_wallet, msg.sender);
    }
    
    function approveRecovery(address _wallet) external override nonReentrant {
        RecoveryRequest storage request = recoveryRequests[_wallet];
        require(request.isActive, "No active recovery request");
        require(!request.hasApproved[msg.sender], "Already approved");
        require(block.timestamp - request.timestamp <= RECOVERY_TIMEOUT, "Recovery timeout");
        
        request.hasApproved[msg.sender] = true;
        request.approvals++;
        
        emit RecoveryApproved(_wallet, msg.sender);
        
        if (request.approvals >= request.threshold) {
            request.isActive = false;
            emit RecoveryCompleted(_wallet);
        }
    }
}