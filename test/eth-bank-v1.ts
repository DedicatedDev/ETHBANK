import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EthBank, MockERC20 } from "../typechain";
import { deployBankContract, deployERC20Contract } from "./helper";
import { BigNumber } from "ethers";

describe("ETHBankV1", () => {
  let etherBank: EthBank;
  let mockDAIToken: MockERC20;
  let mockBNBToken: MockERC20;
  let testAccounts: SignerWithAddress[];
  let admin: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;

  const testDepositAmount = ethers.utils.parseEther("100");

  async function prepareDeposit(to: SignerWithAddress, mintAmount: BigNumber) {
    await mockDAIToken.testMint(to.address, mintAmount);
    const mintedAmount = await mockDAIToken.balanceOf(to.address);
    expect(mintAmount).to.equal(mintedAmount);
    await mockDAIToken.connect(to).approve(etherBank.address, mintAmount);
  }

  beforeEach(async () => {
    testAccounts = await ethers.getSigners();
    [admin, user1, user2] = testAccounts;
    etherBank = await deployBankContract(admin.address);
    mockDAIToken = await deployERC20Contract("DAI", "DAI");
  });

  describe("Deposit (ETH)", () => {
    it("Should deposit ETH", async () => {
      await expect(
        etherBank.connect(user1).depositETH({ value: testDepositAmount })
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(
          user1.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        ethers.constants.AddressZero
      );
      expect(depositedBalance).to.equal(testDepositAmount);
    });

    it("Should revert to deposit with invalid amount", async () => {
      await expect(
        etherBank.connect(user1).depositETH({ value: 0 })
      ).to.be.revertedWith("ETHBANK: Amount must be greater than 0");
    });
  });
  describe("Deposit (ERC20)", () => {
    it("Should deposit ERC20 Token", async () => {
      await prepareDeposit(user1, testDepositAmount);
      await expect(
        etherBank
          .connect(user1)
          .depositERC20(mockDAIToken.address, testDepositAmount)
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(user1.address, mockDAIToken.address, testDepositAmount);

      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(depositedBalance).to.equal(testDepositAmount);
    });

    it("Should revert to deposit with invalid amount", async () => {
      await expect(
        etherBank.connect(user1).depositERC20(mockDAIToken.address, 0)
      ).to.be.revertedWith("ETHBANK: Amount must be greater than 0");
    });
  });

  describe("Withdraw (ETH)", () => {
    it("Should withdraw eth from contract", async () => {
      /*
        Deposit
      */
      await expect(
        etherBank.connect(user1).depositETH({ value: testDepositAmount })
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(
          user1.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );

      /*
        Withdraw
      */
      await expect(etherBank.connect(user1).withdraw(testDepositAmount))
        .to.be.emit(etherBank, "Withdraw")
        .withArgs(
          user1.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );
    });

    it("Should revert to withdraw eth from contract with invalid amount", async () => {
      /*
        Deposit
      */
      await expect(
        etherBank.connect(user1).depositETH({ value: testDepositAmount })
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(
          user1.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );

      /*
        Withdraw
      */
      await expect(
        etherBank.connect(user1).withdraw(testDepositAmount.add(10))
      ).to.be.revertedWith("ETHBANK: Not enough balance");
    });
  });

  describe("Withdraw (ERC20)", () => {
    it("Should withdraw ERC20 Token from contract", async () => {
      /*
        Deposit
      */
      await prepareDeposit(user1, testDepositAmount);
      await expect(
        etherBank
          .connect(user1)
          .depositERC20(mockDAIToken.address, testDepositAmount)
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(user1.address, mockDAIToken.address, testDepositAmount);

      const depositAmount = await mockDAIToken.balanceOf(etherBank.address);

      expect(depositAmount).to.equal(testDepositAmount);

      /*
        Withdraw
      */
      await expect(
        etherBank.connect(user1).withdraw(depositAmount.add(10))
      ).to.be.revertedWith("ETHBANK: Not enough balance");

      await expect(etherBank.connect(user1).withdraw(0)).to.be.revertedWith(
        "ETHBANK: Amount must be greater than 0"
      );
    });

    it("Should reject to withdraw ERC20 Token from contract with the invalid amount", async () => {
      /*
        Deposit
      */
      await prepareDeposit(user1, testDepositAmount);
      await expect(
        etherBank
          .connect(user1)
          .depositERC20(mockDAIToken.address, testDepositAmount)
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(user1.address, mockDAIToken.address, testDepositAmount);

      const depositAmount = await mockDAIToken.balanceOf(etherBank.address);

      expect(depositAmount).to.equal(testDepositAmount);
      /*
        Withdraw
      */
      await expect(
        etherBank
          .connect(user1)
          .withdrawERC20(mockDAIToken.address, depositAmount.add(10))
      ).to.be.revertedWith("ETHBANK: Not enough balance");

      await expect(
        etherBank.connect(user1).withdrawERC20(mockDAIToken.address, 0)
      ).to.be.revertedWith("ETHBANK: Amount must be greater than 0");
    });
  });

  describe("Pause (eth bank)", () => {
    it("Should pause deposit", async () => {
      await etherBank.pause();
      await prepareDeposit(user1, testDepositAmount);

      await expect(
        etherBank.connect(user1).depositETH({ value: testDepositAmount })
      ).to.be.revertedWith("Pausable: paused");

      await expect(
        etherBank
          .connect(user1)
          .depositERC20(mockDAIToken.address, testDepositAmount)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should pause withdraw", async () => {
      await etherBank.pause();
      /*
        Withdraw
      */
      await expect(
        etherBank.connect(user1).withdraw(testDepositAmount)
      ).to.be.revertedWith("Pausable: paused");

      await expect(
        etherBank
          .connect(user1)
          .withdrawERC20(mockDAIToken.address, testDepositAmount)
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});
