// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
dotenv.config();
async function main() {
  const admin = process.env.ADMIN_ADDRESS;
  const ethBankFactory = await ethers.getContractFactory("EthBank");
  const etherBank = await upgrades.deployProxy(ethBankFactory, [admin], {
    kind: "uups",
  });
  await etherBank.deployed();
  const data = readFileSync("./.env", { encoding: "utf8" });
  let splitArray = data.split("\n");
  splitArray.splice(splitArray.indexOf("CONTRACT"), 1);
  splitArray.push(`CONTRACT=${etherBank.address}`);
  let result = splitArray.join("\n");
  writeFileSync("./.env", result);
  
  console.log("=========DEPLOYED ADDRESS===========");
  console.log(etherBank.address);
  console.log("====================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
