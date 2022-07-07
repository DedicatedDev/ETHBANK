import { ethers, upgrades } from "hardhat";
import { EthBank, IERC20Upgradeable, MockERC20 } from "../typechain";

export async function deployBankContract(admin: string): Promise<EthBank> {
  const ethBankFactory = await ethers.getContractFactory("EthBank");
  const etherBank: EthBank = (await upgrades.deployProxy(
    ethBankFactory,
    [admin],
    {
      kind: "uups",
    }
  )) as EthBank;
  return await etherBank.deployed();
}

export async function deployERC20Contract(
  name: string,
  symbol: string
): Promise<MockERC20> {
  const tokenFactory = await ethers.getContractFactory("MockERC20");
  const erc20Token = await tokenFactory.deploy(name, symbol);
  return await erc20Token.deployed();
}


