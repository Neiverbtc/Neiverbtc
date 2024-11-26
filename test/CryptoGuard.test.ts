import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CryptoGuard", function () {
  let cryptoGuard: Contract;
  let monitor: Contract;
  let recovery: Contract;
  let owner: SignerWithAddress;
  let guardians: SignerWithAddress[];
  let nonGuardian: SignerWithAddress;

  beforeEach(async function () {
    [owner, ...guardians, nonGuardian] = await ethers.getSigners();

    // Deploy Monitor contract
    const Monitor = await ethers.getContractFactory("Monitor");
    monitor = await Monitor.deploy();

    // Deploy Recovery contract
    const Recovery = await ethers.getContractFactory("Recovery");
    recovery = await Recovery.deploy();

    // Deploy CryptoGuard contract
    const CryptoGuard = await ethers.getContractFactory("CryptoGuard");
    cryptoGuard = await CryptoGuard.deploy(
      await monitor.getAddress(),
      await recovery.getAddress()
    );
  });

  describe("Wallet Creation", function () {
    it("Should create a new wallet with valid parameters", async function () {
      const encryptedKey = ethers.randomBytes(32);
      const guardianAddresses = guardians.slice(0, 3).map(g => g.address);
      const threshold = 2;

      await expect(cryptoGuard.createWallet(encryptedKey, guardianAddresses, threshold))
        .to.emit(cryptoGuard, "WalletCreated")
        .withArgs(owner.address);

      const wallet = await cryptoGuard.wallets(owner.address);
      expect(wallet.isActive).to.be.true;
      expect(wallet.threshold).to.equal(threshold);
    });

    it("Should fail if threshold is greater than number of guardians", async function () {
      const encryptedKey = ethers.randomBytes(32);
      const guardianAddresses = guardians.slice(0, 2).map(g => g.address);
      const threshold = 3;

      await expect(
        cryptoGuard.createWallet(encryptedKey, guardianAddresses, threshold)
      ).to.be.revertedWith("Invalid threshold");
    });

    it("Should fail if wallet already exists", async function () {
      const encryptedKey = ethers.randomBytes(32);
      const guardianAddresses = guardians.slice(0, 3).map(g => g.address);
      const threshold = 2;

      await cryptoGuard.createWallet(encryptedKey, guardianAddresses, threshold);

      await expect(
        cryptoGuard.createWallet(encryptedKey, guardianAddresses, threshold)
      ).to.be.revertedWith("Wallet already exists");
    });
  });

  describe("Guardian Management", function () {
    beforeEach(async function () {
      const encryptedKey = ethers.randomBytes(32);
      const guardianAddresses = guardians.slice(0, 3).map(g => g.address);
      const threshold = 2;
      await cryptoGuard.createWallet(encryptedKey, guardianAddresses, threshold);
    });

    it("Should add a new guardian", async function () {
      await expect(cryptoGuard.addGuardian(nonGuardian.address))
        .to.emit(cryptoGuard, "GuardianAdded")
        .withArgs(owner.address, nonGuardian.address);

      expect(await cryptoGuard.isGuardian(owner.address, nonGuardian.address)).to.be.true;
    });

    it("Should fail to add existing guardian", async function () {
      const existingGuardian = guardians[0].address;
      await expect(
        cryptoGuard.addGuardian(existingGuardian)
      ).to.be.revertedWith("Already a guardian");
    });
  });

  describe("Threshold Management", function () {
    beforeEach(async function () {
      const encryptedKey = ethers.randomBytes(32);
      const guardianAddresses = guardians.slice(0, 3).map(g => g.address);
      const threshold = 2;
      await cryptoGuard.createWallet(encryptedKey, guardianAddresses, threshold);
    });

    it("Should update threshold", async function () {
      const newThreshold = 3;
      await expect(cryptoGuard.updateThreshold(newThreshold))
        .to.emit(cryptoGuard, "ThresholdUpdated")
        .withArgs(owner.address, newThreshold);

      const wallet = await cryptoGuard.wallets(owner.address);
      expect(wallet.threshold).to.equal(newThreshold);
    });

    it("Should fail if new threshold exceeds guardian count", async function () {
      const invalidThreshold = 4;
      await expect(
        cryptoGuard.updateThreshold(invalidThreshold)
      ).to.be.revertedWith("Invalid threshold");
    });
  });
});