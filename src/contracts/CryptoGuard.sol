// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMonitor.sol";
import "./interfaces/IRecovery.sol";

/**
 * @title CryptoGuard
 * @dev Main contract for the CryptoGuard Protocol
 */
contract CryptoGuard is ReentrancyGuard, Ownable {
    IMonitor public monitor;
    IRecovery public recovery;
    
    struct Wallet {
        bytes32 encryptedPrivateKey;
        address[] guardians;
        uint256 threshold;
        bool isActive;
    }
    
    mapping(address => Wallet) public wallets;
    
    event WalletCreated(address indexed owner);
    event GuardianAdded(address indexed wallet, address indexed guardian);
    event ThresholdUpdated(address indexed wallet, uint256 newThreshold);
    
    constructor(address _monitor, address _recovery) Ownable(msg.sender) {
        monitor = IMonitor(_monitor);
        recovery = IRecovery(_recovery);
    }
    
    function createWallet(
        bytes32 _encryptedPrivateKey,
        address[] memory _guardians,
        uint256 _threshold
    ) external nonReentrant {
        require(!wallets[msg.sender].isActive, "Wallet already exists");
        require(_guardians.length >= _threshold, "Invalid threshold");
        
        wallets[msg.sender] = Wallet({
            encryptedPrivateKey: _encryptedPrivateKey,
            guardians: _guardians,
            threshold: _threshold,
            isActive: true
        });
        
        emit WalletCreated(msg.sender);
    }
    
    function addGuardian(address _guardian) external {
        require(wallets[msg.sender].isActive, "Wallet not found");
        require(!isGuardian(msg.sender, _guardian), "Already a guardian");
        
        wallets[msg.sender].guardians.push(_guardian);
        emit GuardianAdded(msg.sender, _guardian);
    }
    
    function updateThreshold(uint256 _newThreshold) external {
        require(wallets[msg.sender].isActive, "Wallet not found");
        require(_newThreshold <= wallets[msg.sender].guardians.length, "Invalid threshold");
        
        wallets[msg.sender].threshold = _newThreshold;
        emit ThresholdUpdated(msg.sender, _newThreshold);
    }
    
    function isGuardian(address _wallet, address _guardian) public view returns (bool) {
        address[] memory guardians = wallets[_wallet].guardians;
        for (uint i = 0; i < guardians.length; i++) {
            if (guardians[i] == _guardian) return true;
        }
        return false;
    }
}