// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMonitor.sol";

/**
 * @title Monitor
 * @dev Monitors transactions and detects suspicious patterns
 */
contract Monitor is IMonitor, Ownable {
    struct TransactionPattern {
        uint256 frequency;
        uint256 maxAmount;
        uint256 timeWindow;
    }
    
    mapping(address => TransactionPattern) public patterns;
    mapping(address => uint256) public lastActivity;
    
    event SuspiciousActivity(address indexed wallet, string reason);
    
    constructor() Ownable(msg.sender) {}
    
    function setPattern(
        uint256 _frequency,
        uint256 _maxAmount,
        uint256 _timeWindow
    ) external {
        patterns[msg.sender] = TransactionPattern({
            frequency: _frequency,
            maxAmount: _maxAmount,
            timeWindow: _timeWindow
        });
    }
    
    function checkTransaction(
        address _wallet,
        uint256 _amount
    ) external override returns (bool) {
        TransactionPattern memory pattern = patterns[_wallet];
        
        if (pattern.timeWindow == 0) return true;
        
        if (_amount > pattern.maxAmount) {
            emit SuspiciousActivity(_wallet, "Amount exceeds maximum");
            return false;
        }
        
        if (block.timestamp - lastActivity[_wallet] < pattern.timeWindow) {
            emit SuspiciousActivity(_wallet, "Too frequent transactions");
            return false;
        }
        
        lastActivity[_wallet] = block.timestamp;
        return true;
    }
}