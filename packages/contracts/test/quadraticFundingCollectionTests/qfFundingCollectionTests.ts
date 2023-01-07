import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { deployGitcoinMumbaiFixture } from "../gitcoinTests/gitcoin.fixture";
import { deployLensMumbaiFixture } from "../lensTests/lens.fixture";
import { Signers } from "../types";
import { shouldBehaveLikeQFCollectionModule } from "./quadraticFundingCollection.behavior";


  describe("Quadratic Funding Collection Module", () => {
    before(async function () {
      this.signers = {} as Signers;
  
      const signers: SignerWithAddress[] = await ethers.getSigners();
      this.signers.admin = signers[0];
      this.signers.user = signers[2];
      this.signers.userTwo = signers[3];
      this.loadFixture = loadFixture;
    });
    
    beforeEach(async function () {
      // deploy lens fixture 
      const { lensMumbai, freeCollectModule, qfCollectionModule, feeCollectModule ,governanceWallet, moduleGlobals, testCollect } = await loadFixture(deployLensMumbaiFixture);
      this.lensMumbai = lensMumbai;
      this.qfCollectionModule = qfCollectionModule;
      this.freeCollectModule = freeCollectModule;
      this.feeCollectModule = feeCollectModule;
      this.signers.gov = governanceWallet;
      this.moduleGlobals = moduleGlobals;

      this.testCollect = testCollect;

      // deploy gitcoin fixture
      const { roundImplementation, WETH, payoutStrategy, votingStrategy, currentBlockTimestamp } =
    await loadFixture(deployGitcoinMumbaiFixture);

    this.WETH = WETH;
    this.roundImplementation = roundImplementation;
    this.payoutStrategy = payoutStrategy;
    this.votingStrategy = votingStrategy;
    this.currentBlockTimestamp = currentBlockTimestamp;

    });
    shouldBehaveLikeQFCollectionModule();
  });





