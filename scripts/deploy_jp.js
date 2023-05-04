// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const name = "JpEthStakingFundSp";
  const symbol = "JPETH";
  const tokenDecimals = 6; 
  // input your address here 
  const manager = ""
  const owner = ""

  const JpEthStakingFundSp = await hre.ethers.getContractFactory("JpEthStakingFundSp");
  const jpEthStakingFundSp = await JpEthStakingFundSp.deploy(name, symbol, manager, owner, tokenDecimals);;

  await jpEthStakingFundSp.deployed();

  console.log(
    `JpEthStakingFundSp with ${name}, ${symbol}, ${tokenDecimals} decimals and 
    manager address ${manager} and owner address ${owner} deployed to ${jpEthStakingFundSp.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
