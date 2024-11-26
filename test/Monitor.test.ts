import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Monitor", function () {
  let monitor: Contract;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Monitor = await ethers.getContractFactory("Monitor");
    monitor = await Monitor.deploy();
  });

  describe("Transaction Pattern Management", function () {
    it("Should set transaction pattern", async function () {
      const frequency = 5;
      const maxAmount = ethers.parseEther("1.0");
      const timeWindow = 3600; // 1 hour

      await monitor.connect(user).setPattern(frequency, maxAmount, timeWindow);

      const pattern = await monitor.patterns(user.address);
      expect(pattern.frequency).to.equal(frequency);
      expect(pattern.maxAmount).to.equal(maxAmount);
      expect(pattern.timeWindow).to.equal(timeWindow);
    });
  });

  describe("Transaction Monitoring", function () {
    beforeEach(async function () {
      const frequency = 5;
      const maxAmount = ethers.parseEther("1.0");
      const timeWindow = 3600;
      await monitor.connect(user).setPattern(frequency, maxAmount, timeWindow);
    });

    it("Should allow transaction within limits", async function () {
      const amount = ethers.parseEther("0.5");
      expect(await monitor.checkTransaction(user.address, amount)).to.be.true;
    });

    it("Should reject transaction exceeding max amount", async function () {
      const amount = ethers.parseEther("1.5");
      await expect(monitor.checkTransaction(user.address, amount))
        .to.emit(monitor, "SuspiciousActivity")
        .withArgs(user.address, "Amount exceeds maximum");
    });

    it("Should reject frequent transactions", async function () {
      const amount = ethers.parseEther("0.5");
      await monitor.checkTransaction(user.address, amount);
      
      await expect(monitor.checkTransaction(user.address, amount))
        .to.emit(monitor, "SuspiciousActivity")
        .withArgs(user.address, "Too frequent transactions");
    });
  });
});