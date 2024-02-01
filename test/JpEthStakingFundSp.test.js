const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  describe("JpEthStakingFundSp", function () {
    async function deployJpEthStakingFundSpFixture() {
      const name = "JpEthStakingFundSp";
      const symbol = "JPETH";
      const tokenDecimals = 6;

      const [deployer, manager, owner, ...otherAccounts] = await ethers.getSigners();

      const JpEthStakingFundSp = await ethers.getContractFactory("JpEthStakingFundSp");
      const jpEthStakingFundSp = await JpEthStakingFundSp.deploy(name, symbol, manager.address, owner.address, tokenDecimals);

      return { jpEthStakingFundSp, name, symbol, manager, owner, otherAccounts, tokenDecimals};
    }
    describe("Deployment", function () {
        it("Should set the right name", async function(){
            const { jpEthStakingFundSp, name } = await loadFixture(deployJpEthStakingFundSpFixture);
            expect(await jpEthStakingFundSp.name()).to.equal(name);
        });

        it("Should set the right symbol", async function(){
            const { jpEthStakingFundSp, symbol } = await loadFixture(deployJpEthStakingFundSpFixture);
            expect(await jpEthStakingFundSp.symbol()).to.equal(symbol);
        });

        it("Should set the right manager", async function(){
            const { jpEthStakingFundSp, manager } = await loadFixture(deployJpEthStakingFundSpFixture);
            expect(await jpEthStakingFundSp.getManager()).to.equal(manager.address);
        });

        it("Should set the right whitelister", async function(){
            const { jpEthStakingFundSp, manager } = await loadFixture(deployJpEthStakingFundSpFixture);
            expect(await jpEthStakingFundSp.getWhitelister()).to.equal(manager.address);
        });

        it("Should set the right owner", async function(){
            const { jpEthStakingFundSp, owner } = await loadFixture(deployJpEthStakingFundSpFixture);
            expect(await jpEthStakingFundSp.owner()).to.equal(owner.address);
        });

        it("Should has the right decimals", async function(){
            const { jpEthStakingFundSp, tokenDecimals } = await loadFixture(deployJpEthStakingFundSpFixture);
            expect(await jpEthStakingFundSp.decimals()).to.equal(tokenDecimals);
        });

    });

    describe("Mint", function () {
        
        it("Should revert if not called by manager", async function(){
            const { jpEthStakingFundSp, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await expect(jpEthStakingFundSp.connect(otherAccounts[0]).mint(otherAccounts[0].address,100)).to.be.revertedWith("JPETHStakingFundSP: caller is not the manager");
        });
        describe ("for a manager", function() {
            it("Should revert if to is a null address", async function(){
                const { jpEthStakingFundSp, manager } = await loadFixture(deployJpEthStakingFundSpFixture);
                await expect(jpEthStakingFundSp.connect(manager).mint(ZERO_ADDRESS,100)).to.be.revertedWith("ERC20: mint to the zero address");
            });
            it("Should increase the total supply", async function(){
                const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
                //console.log("manager:", manager.address);
                await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
                //console.log("totalSupply", await jpEthStakingFundSp.totalSupply());
                expect(await jpEthStakingFundSp.totalSupply()).to.equal(100);
            });
            it("Should increase the balance of the to address", async function(){
                const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
                await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
                expect(await jpEthStakingFundSp.balanceOf(otherAccounts[0].address)).to.equal(100);
            });
            it("Should emit a Transfer event", async function(){
                const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
                await expect(jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100)).to.emit(jpEthStakingFundSp, "Transfer").withArgs(ZERO_ADDRESS, otherAccounts[0].address, 100);
            });
        });
    });

    describe("Burn", function () {
        it("Should revert if not called by manager", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await expect(jpEthStakingFundSp.connect(otherAccounts[0]).burn(otherAccounts[0].address,100)).to.be.revertedWith("JPETHStakingFundSP: caller is not the manager");
        });
        it("Should revert if the amount is greater than the balance", async function(){
            const { jpEthStakingFundSp, manager} = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(manager.address,100);
            await expect(jpEthStakingFundSp.connect(manager).burn(manager.address,101)).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
        /* it("Should burn from the owner address", async function(){
            const { jpEthStakingFundSp, manager, owner, otherAccounts} = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).managerRedeem(otherAccounts[0].address,100);
            await expect(jpEthStakingFundSp.connect(manager).burn(100)).to.emit(jpEthStakingFundSp, "Transfer").withArgs(owner.address, ZERO_ADDRESS, 100);
        }); */
        it("Should burn from owner address", async function(){
            const { jpEthStakingFundSp, manager, owner, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[1].address,1000);
            //await jpEthStakingFundSp.connect(manager).managerRedeem(otherAccounts[0].address,100);
            await expect(jpEthStakingFundSp.connect(manager).burn(otherAccounts[0].address, 50)).to.changeTokenBalances(
                jpEthStakingFundSp,
                [otherAccounts[0], otherAccounts[1]],
                [-50, 0]
            )
        });
        it("Should decrease the total supply", async function(){
            const { jpEthStakingFundSp, manager, owner, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[1].address,1000);
            //await jpEthStakingFundSp.connect(manager).managerRedeem(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).burn(otherAccounts[0].address,50);
            expect(await jpEthStakingFundSp.totalSupply()).to.equal(1050);
        });
    });

    describe("UpdateManager", function () {
        it("Should revert if not called by the owner", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await expect(jpEthStakingFundSp.connect(manager).updateManager(otherAccounts[0].address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Should update non-zero address as a manager", async function(){
            const { jpEthStakingFundSp, owner} = await loadFixture(deployJpEthStakingFundSpFixture);
            await expect( jpEthStakingFundSp.connect(owner).updateManager(ZERO_ADDRESS)).to.be.revertedWith("JPETHStakingFundSP: new manager is the zero address");    
        });
        it("Should update the manager", async function(){
            const { jpEthStakingFundSp, owner, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(owner).updateManager(otherAccounts[0].address);
            expect(await jpEthStakingFundSp.getManager()).to.equal(otherAccounts[0].address);
        });
    });
    
    describe("Transfer", function() {
        it("Should revert if JPETHStakingFundSP transfer: paused", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await expect( jpEthStakingFundSp.connect(otherAccounts[0]).transfer(otherAccounts[1].address, 100)).to.be.revertedWith("JPETHStakingFundSP transfer: paused");
        }); 
        
        it("Should revert if JPETHStakingFundSP transfer: from's address not whitelisted", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await expect( jpEthStakingFundSp.connect(otherAccounts[0]).transfer(otherAccounts[1].address, 100)).to.be.revertedWith("inWhitelist: account is not whitelisted");
        });
        
        it("Should revert if JPETHStakingFundSP transfer: to's address not whitelisted", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[0].address);
            await expect( jpEthStakingFundSp.connect(otherAccounts[0]).transfer(otherAccounts[1].address, 100)).to.be.revertedWith("inWhitelist: account is not whitelisted");
        });

        it("Should transfer if JPETHStakingFundSP transfer: from's and to's address whitelisted", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[0].address);
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[1].address);
            await expect( jpEthStakingFundSp.connect(otherAccounts[0]).transfer(otherAccounts[1].address, 100)).to.changeTokenBalances(
                jpEthStakingFundSp, 
                [otherAccounts[0], otherAccounts[1]], 
                [-100, 100]
            );    
        });

        it("Should emit a Transfer event", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[0].address);
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[1].address);
            await expect( jpEthStakingFundSp.connect(otherAccounts[0]).transfer(otherAccounts[1].address, 100)).to.emit(jpEthStakingFundSp, "Transfer").withArgs(otherAccounts[0].address, otherAccounts[1].address, 100);
        });
    });

    describe("TransferFrom", function() {
        it("Should revert if JPETHStakingFundSP transferFrom: paused", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(otherAccounts[0]).approve(otherAccounts[1].address, 100);
            await expect( jpEthStakingFundSp.connect(otherAccounts[1])
              .transferFrom(otherAccounts[0].address, otherAccounts[2].address, 100))
              .to.be.revertedWith("JPETHStakingFundSP transfer: paused");
        });

        it("Should revert if JPETHStakingFundSP transferFrom: from's address not whitelisted", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(otherAccounts[0]).approve(otherAccounts[1].address, 100);
            await expect( jpEthStakingFundSp.connect(otherAccounts[1])
              .transferFrom(otherAccounts[0].address, otherAccounts[2].address, 100))
              .to.be.revertedWith("inWhitelist: account is not whitelisted");
        });

        it("Should revert if JPETHStakingFundSP transferFrom: to's address not whitelisted", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[0].address);
            await jpEthStakingFundSp.connect(otherAccounts[0]).approve(otherAccounts[1].address, 100);
            await expect( jpEthStakingFundSp.connect(otherAccounts[1])
              .transferFrom(otherAccounts[0].address, otherAccounts[2].address, 100))
              .to.be.revertedWith("inWhitelist: account is not whitelisted");
        });

        it("Should transferFrom if JPETHStakingFundSP transferFrom: from's and to's address whitelisted", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[0].address);
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[2].address);
            await jpEthStakingFundSp.connect(otherAccounts[0]).approve(otherAccounts[1].address, 100);
            await expect( jpEthStakingFundSp.connect(otherAccounts[1])
              .transferFrom(otherAccounts[0].address, otherAccounts[2].address, 100))
              .to.changeTokenBalances(
                jpEthStakingFundSp, 
                [otherAccounts[0], otherAccounts[2]], 
                [-100, 100]
            );
        });

        it("Should emit a Transfer event", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).unpause();
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[0].address);
            await jpEthStakingFundSp.connect(manager).addWhitelist(otherAccounts[2].address);
            await jpEthStakingFundSp.connect(otherAccounts[0]).approve(otherAccounts[1].address, 100);
            await expect( jpEthStakingFundSp.connect(otherAccounts[1])
              .transferFrom(otherAccounts[0].address, otherAccounts[2].address, 100))
              .to.emit(jpEthStakingFundSp, "Transfer").withArgs(otherAccounts[0].address, otherAccounts[2].address, 100);
        });
    });

    describe("totalSupply" , function() {
        it("case 1:Should return correct totalSupply", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            expect(await jpEthStakingFundSp.totalSupply()).to.equal(100);
        });
        it("case 2:Should return correct totalSupply", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[1].address,499999999900)
            expect(await jpEthStakingFundSp.totalSupply()).to.equal(500000000000);
        });
        it("case 3:Should return correct totalSupply", async function(){
            const { jpEthStakingFundSp, manager, otherAccounts } = await loadFixture(deployJpEthStakingFundSpFixture);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,400000000000);
            await jpEthStakingFundSp.connect(manager).mint(manager.address,100000000000);
            //await jpEthStakingFundSp.connect(manager).managerRedeem(otherAccounts[0].address,100000000000);
            //await jpEthStakingFundSp.connect(manager).managerRedeem(manager.address,100000000000);
            await jpEthStakingFundSp.connect(manager).burn(otherAccounts[0].address,100000000000);
            await jpEthStakingFundSp.connect(manager).mint(otherAccounts[0].address,100000000000);
            expect(await jpEthStakingFundSp.totalSupply()).to.equal(500000000000);
        });
    });

});