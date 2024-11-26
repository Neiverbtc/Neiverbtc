import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Recovery", function () {
  let recovery: Contract;
  let owner: SignerWithAddress;
  let wallet: SignerWithAddress;
  let guardians: SignerWithAddress[];

  beforeEach(async function () {
    [owner, wallet, ...guardians] = await ethers.getSigners();
    const Recovery = await ethers.getContractFactory("Recovery");
    recovery = await Recovery.deploy();
  });

  describe("Recovery Process", function () {
    it("Should initiate recovery", async function () {
      await expect(recovery.connect(guardians[0]).initiateRecovery(wallet.address))
        .to.emit(recovery, "RecoveryInitiated")
        .withArgs(wallet.address, guardians[0].address);

      const request = await recovery.recoveryRequests(wallet.address);
      expect(request.isActive).to.be.true;
      expect(request.initiator).to.equal(guardians[0].address);
    });

    it("Should not allow multiple active recovery requests", async function () {
      await recovery.connect(guardians[0]).initiateRecovery(wallet.address);

      await expect(
        recovery.connect(guardians[1]).initiateRecovery(wallet.address)
      ).to.be.revertedWith("Recovery already in progress");
    });

    it("Should approve recovery request", async function () {
      await recovery.connect(guardians[0]).initiateRecovery(wallet.address);

      await expect(recovery.connect(guardians[1]).approveRecovery(wallet.address))
        .to.emit(recovery, "RecoveryApproved")
        .withArgs(wallet.address, guardians[1].address);
    });

    it("Should not allow double approval", async function () {
      await recovery.connect(guardians[0]).initiateRecovery(wallet.address);
      await recovery.connect(guardians[1]).approveRecovery(wallet.address);

      await expect(
        recovery.connect(guardians[1]).approveRecovery(wallet.address)
      ).to.be.revertedWith("Already approved");
    });

    it("Should complete recovery after threshold approvals", async function () {
      await recovery.connect(guardians[0]).initiateRecovery(wallet.address);
      
      // First approval
      await recovery.connect(guardians[1]).approveRecovery(wallet.address);
      
      // Second approval should complete the recovery
      await expect(recovery.connect(guardians[2]).approveRecovery(wallet.address))
        .to.emit(recovery, "RecoveryCompleted")
        .withArgs(wallet.address);

      const request = await recovery.recoveryRequests(wallet.address);
      expect(request.isActive).to.be.false;
    });

    it("Should not allow recovery approval after timeout", async function () {
      await recovery.connect(guardians[0]).initiateRecovery(wallet.address);
      
      // Move time forward past the recovery timeout
      await time.increase(7 * 24 * 60 * 60 + 1); // 7 days + 1 second

      await expect(
        recovery.connect(guardians[1]).approveRecovery(wallet.address)
      ).to.be.revertedWith("Recovery timeout");
    });
  });
});