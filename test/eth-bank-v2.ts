import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EthBank, ETHBankV2, MockERC20 } from "../typechain";
import {
  deployBankContract,
  deployERC20Contract,
  upgradeContract,
} from "./helper";
import { BigNumber } from "ethers";

describe("ETHBankV2", () => {
  let etherBank: EthBank;
  let etherBankV2: ETHBankV2;
  let mockDAIToken: MockERC20;
  let testAccounts: SignerWithAddress[];
  let admin: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;

  const testDepositAmount = ethers.utils.parseEther("100");

  async function prepareDeposit(to: SignerWithAddress, mintAmount: BigNumber) {
    await mockDAIToken.testMint(to.address, mintAmount);
    const mintedAmount = await mockDAIToken.balanceOf(to.address);
    expect(mintAmount).to.equal(mintedAmount);
    await mockDAIToken.connect(to).approve(etherBankV2.address, mintAmount);
  }

  beforeEach(async () => {
    testAccounts = await ethers.getSigners();
    [admin, user1, user2] = testAccounts;
    etherBank = await deployBankContract(admin.address);
    mockDAIToken = await deployERC20Contract("DAI", "DAI");
    const etherBankV2Factory = await ethers.getContractFactory("ETHBankV2");
    etherBankV2 = (await upgradeContract(
      etherBank,
      etherBankV2Factory
    )) as ETHBankV2;
    expect(etherBankV2.address).to.equal(etherBank.address);
  });

  describe("Transfer (ETH)", () => {
    it("Should transfer ETH to exist bank account", async () => {
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
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        ethers.constants.AddressZero
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /*
      Transfer from user1 to user2
      */
      await expect(
        etherBankV2.transferETH(user1.address, user2.address, testDepositAmount)
      )
        .to.be.emit(etherBankV2, "EthBankTransfer")
        .withArgs(
          user1.address,
          user2.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );

      const balanceOfUser1 = await etherBank.getBalanceOf(
        user1.address,
        ethers.constants.AddressZero
      );
      expect(balanceOfUser1).to.equal("0");
      const balanceOfUser2 = await etherBank.getBalanceOf(
        user2.address,
        ethers.constants.AddressZero
      );
      expect(balanceOfUser2).to.equal(testDepositAmount.toString());
    });

    it("Should transfer ETH to external address", async () => {
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
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        ethers.constants.AddressZero
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /*
        Transfer from user1 to user2
        */
      await expect(
        etherBankV2.transferToExternal(
          user1.address,
          user2.address,
          testDepositAmount
        )
      )
        .to.be.emit(etherBankV2, "EthBankTransfer")
        .withArgs(
          user1.address,
          user2.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );

      const balanceOfUser1 = await etherBank.getBalanceOf(
        user1.address,
        ethers.constants.AddressZero
      );
      expect(balanceOfUser1).to.equal("0");
      const balanceDiffer = (await user2.getBalance()).sub(
        await testAccounts[4].getBalance()
      );
      expect(balanceDiffer).to.equal(testDepositAmount);
    });
    it("Should revert to transfer ETH to external address with invalid amount", async () => {
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
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        ethers.constants.AddressZero
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /*
            Transfer from user1 to user2
            */
      await expect(
        etherBankV2.transferToExternal(
          user1.address,
          user2.address,
          testDepositAmount.add(10)
        )
      ).to.be.revertedWith("ETHBANK: Not enough ETH");

      await expect(
        etherBankV2.transferToExternal(user1.address, user2.address, 0)
      ).to.be.revertedWith("ETHBANK: Amount must be greater than 0");
    });
  });

  describe("Transfer (ERC20)", () => {
    it("Should transfer ERC20 to exist bank account", async () => {
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
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /*
      Transfer from user1 to user2
      */
      await expect(
        etherBankV2.transferERC20(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount
        )
      )
        .to.be.emit(etherBankV2, "EthBankTransfer")
        .withArgs(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount
        );

      const balanceOfUser1 = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(balanceOfUser1).to.equal("0");
      const balanceOfUser2 = await etherBank.getBalanceOf(
        user2.address,
        mockDAIToken.address
      );
      expect(balanceOfUser2).to.equal(testDepositAmount.toString());
    });

    it("Should transfer ERC20 to external wallet address", async () => {
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

      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /*
      Transfer from user1 to user2
      */
      await expect(
        etherBankV2.transferERC20ToExternal(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount
        )
      )
        .to.be.emit(etherBankV2, "EthBankTransfer")
        .withArgs(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount
        );

      const balanceOfUser1 = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(balanceOfUser1).to.equal("0");
      const balanceOfUser2 = await mockDAIToken.balanceOf(user2.address);
      expect(balanceOfUser2).to.equal(testDepositAmount.toString());
    });
    it("Should revert to transfer ERC20 to external address with invalid amount", async () => {
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
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /*
        Transfer from user1 to user2
        */
      await expect(
        etherBankV2.transferERC20(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount.add(10)
        )
      ).to.be.revertedWith("ETHBANK: Not enough ERC20 Token");

      await expect(
        etherBankV2.transferERC20ToExternal(
          user1.address,
          user2.address,
          mockDAIToken.address,
          0
        )
      ).to.be.revertedWith("ETHBANK: Amount must be greater than 0");
    });
  });

  describe("Pause (All Transactions)", () => {
    it("Should pause all transactions except for withdraw", async () => {
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
      const depositedBalance = await etherBank.getBalanceOf(
        user1.address,
        mockDAIToken.address
      );
      expect(depositedBalance).to.equal(testDepositAmount);

      /* 
      Pause 
      */
      await etherBankV2.pause();

      /*
      Transfer from user1 to user2
      */

      //ETH Transfer between bank accounts
      await expect(
        etherBankV2.transferETH(user1.address, user2.address, testDepositAmount)
      ).to.be.revertedWith("Pausable: paused");

      //ERC20 Transfer between bank accounts
      await expect(
        etherBankV2.transferERC20(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount
        )
      ).to.be.revertedWith("Pausable: paused");

      //ETH Transfer to external
      await expect(
        etherBankV2.transferToExternal(
          user1.address,
          user2.address,
          testDepositAmount
        )
      ).to.be.revertedWith("Pausable: paused");

      //ERC20 Transfer to external
      await expect(
        etherBankV2.transferERC20ToExternal(
          user1.address,
          user2.address,
          mockDAIToken.address,
          testDepositAmount
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should approve eth withdraw", async () => {
      /*
        Deposit
      */
      await expect(
        etherBankV2.connect(user1).depositETH({ value: testDepositAmount })
      )
        .to.be.emit(etherBank, "Deposit")
        .withArgs(
          user1.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );

      /*
        Pause contract 
      */
      await etherBankV2.pause();

      /*
        Withdraw
      */
      await expect(etherBankV2.connect(user1).withdraw(testDepositAmount))
        .to.be.emit(etherBank, "Withdraw")
        .withArgs(
          user1.address,
          ethers.constants.AddressZero,
          testDepositAmount
        );
    });

    it("Should approve erc20 Token withdraw", async () => {
      /*
        Deposit
      */
      await prepareDeposit(user1, testDepositAmount);
      await expect(
        etherBankV2
          .connect(user1)
          .depositERC20(mockDAIToken.address, testDepositAmount)
      )
        .to.be.emit(etherBankV2, "Deposit")
        .withArgs(user1.address, mockDAIToken.address, testDepositAmount);

      const depositAmount = await mockDAIToken.balanceOf(etherBank.address);

      expect(depositAmount).to.equal(testDepositAmount);

      /*
          Pause
      */
      await etherBankV2.pause();

      /*
          Withdraw
      */
      await expect(
        etherBank
          .connect(user1)
          .withdrawERC20(mockDAIToken.address, depositAmount)
      )
        .to.be.emit(etherBank, "Withdraw")
        .withArgs(user1.address, mockDAIToken.address, depositAmount);
    });
  });

  describe("Chain admin of contract", () => {
    it("Should update admin of contract by owner", async () => {
      await etherBankV2.updateAdmin(testAccounts[10].address);
    });
    it("Should revert to update admin of contract by others", async () => {
      await expect(
        etherBankV2.connect(user1).updateAdmin(testAccounts[10].address)
      ).to.be.revertedWith("OwnablePausable: access denied");
    });
  });
});
