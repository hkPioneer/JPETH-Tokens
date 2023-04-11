require("@nomicfoundation/hardhat-toolbox");

const config = require("./config");

/** @type import('hardhat/config').HardhatUserConfig */

const hardhatConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 1200000
  }
};

// hardhatConfig.networks
for (const network of Object.keys(config.networks)) {
  hardhatConfig.networks[network] = config.networks[network]
  if (process.env["ENABLE_HARDHAT_VERBOSE"]) {
    console.error("Detected network:", network)
  }
}

// hardhatConfig.defaultNetwork
if (config.defaultNetwork) {
  hardhatConfig.defaultNetwork = config.defaultNetwork
}

if (config.etherscan) {
  hardhatConfig.etherscan = config.etherscan
}

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = hardhatConfig