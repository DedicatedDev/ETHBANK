// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { Contract } from "ethers";
import ETH_BANK_ABI from "../artifacts/contracts/EthBank.sol/EthBank.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
dotenv.config();
async function main() {
  const originalContractAddress = process.env.CONTRACT;
  const ethBankV2Factory = await ethers.getContractFactory("ETHBankV2");
  const newEthBank = await upgrades.upgradeProxy(
    originalContractAddress!,
    ethBankV2Factory
  );
  console.log("=========UPGRADED===========");
  console.log(newEthBank.address);
  console.log("====================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
