import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

import ERC721Abi from "../../artifacts/contracts/mocks/MockERC721.sol/MockERC721.json";
import LensHubAbi from "../../importedABI/LensHub.json";
import ModuleGlobalsAbi from "../../importedABI/ModuleGlobals.json";
import { IERC20 } from "../../types/@openzeppelin/contracts/token/ERC20/IERC20";
import { ILensHub } from "../../types/contracts/interfaces/ILensHub";
import { IModuleGlobals } from "../../types/contracts/interfaces/IModuleGlobals";
import { IRoundImplementation } from "../../types/contracts/interfaces/IRoundImplementation";
import { IPayoutStrategy } from "../../types/contracts/mocks/IPayoutStrategy";
import { QuadraticVoteCollectModule } from "../../types/contracts/QuadraticVoteCollectModule";
import { deployGitcoinMumbaiFixture } from "../gitcoinTests/gitcoin.fixture";
import { deployLensMumbaiFixture } from "../lensTests/lens.fixture";
import { getCollectModulePubInitData } from "../utils/utils";
import { QuadraticFundingVotingStrategyImplementation } from "./../../types/contracts/gitcoin/votingStrategy/QuadraticFundingStrategy/QuadraticFundingVotingStrategyImplementation";
import { FeeCollectModule } from "./../../types/contracts/lens/modules/FeeCollectModule";
import { FreeCollectModule } from "./../../types/contracts/lens/modules/FreeCollectModule";

export const shouldBehaveLikeQuadraticVoteModule = () => {
let _snapshotId: number;
  let _admin: SignerWithAddress;
  let _user: SignerWithAddress;
  let _userTwo: SignerWithAddress;
  let _gov: SignerWithAddress;
  let _lensMumbai: ILensHub;
  let _qVoteCollectModule: QuadraticVoteCollectModule;
  let _freeCollectModule: FreeCollectModule;
  let _feeCollectModule: FeeCollectModule;
  let _moduleGlobals: IModuleGlobals;
  let _WETH: IERC20;
  let _roundImplementation: IRoundImplementation;
  let _payoutStrategy: IPayoutStrategy;
  let _votingStrategy: QuadraticFundingVotingStrategyImplementation;
  let _currentBlockTimestamp: number;

  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    _admin = signers[0];
    _user = signers[2];
    _userTwo = signers[3];

    // deploy lens fixture
    const { lensMumbai, freeCollectModule, qVoteCollectModule, feeCollectModule, governanceWallet, moduleGlobals } =
      await loadFixture(deployLensMumbaiFixture);
    _lensMumbai = lensMumbai;
    _qVoteCollectModule = qVoteCollectModule;
    _freeCollectModule = freeCollectModule;
    _feeCollectModule = feeCollectModule;
    _gov = governanceWallet;
    _moduleGlobals = moduleGlobals;

    // deploy gitcoin fixture
    const { roundImplementation, WETH, payoutStrategy, votingStrategy, currentBlockTimestamp } = await loadFixture(
      deployGitcoinMumbaiFixture,
    );

    _WETH = WETH;
    _roundImplementation = roundImplementation;
    _payoutStrategy = payoutStrategy;
    _votingStrategy = votingStrategy;
    _currentBlockTimestamp = currentBlockTimestamp;

    _snapshotId = await network.provider.send("evm_snapshot", []);
    //mock contracts
  });
  afterEach("restore blockchain snapshot", async () => {
    await network.provider.send("evm_revert", [_snapshotId]);
  });

  describe("QuadraticVoteCollectModule unit tests", () => {
    let _mockLenshub;
    let _mockModuleGlobals;
    let _mockERC721;

    beforeEach(async () => {
      //deploy mock lenshub
      _mockLenshub = await deployMockContract(_admin, LensHubAbi.abi);
      //deploy mock module globals contract
      _mockModuleGlobals = await deployMockContract(_admin, ModuleGlobalsAbi.abi);
      //deploy mock erc721
      _mockERC721 = await deployMockContract(_admin, ERC721Abi.abi);
      //deploy qfCollectionModule using mocked lenshub and moduleGlobals contact
      const MockedQFCollectionModule = await ethers.getContractFactory("QuadraticVoteCollectModule");
      _qVoteCollectModule = <QuadraticVoteCollectModule>(
        await MockedQFCollectionModule.deploy(_mockLenshub.address, _mockModuleGlobals.address)
      );

      //set mocked contracts to return data needed for tests
      await _mockModuleGlobals.mock.isCurrencyWhitelisted.returns(true);
      await _mockModuleGlobals.mock.getTreasuryData.returns(_qVoteCollectModule.address, 1);
      await _mockLenshub.mock.ownerOf.returns(_userTwo.address);
      await _mockLenshub.mock.getFollowModule.returns(ethers.constants.AddressZero);
      await _mockLenshub.mock.getFollowNFT.returns(_mockERC721.address);
      await _mockERC721.mock.balanceOf.returns(1);
    });

    afterEach("restore blockchain snapshot", async () => {
      await network.provider.send("evm_revert", [_snapshotId]);
    });
    it("Should initialize the QVCM with WETH", async function () {
      const DEFAULT_COLLECT_PRICE = ethers.utils.parseEther("1");
      const collectModuleInitData = getCollectModulePubInitData([
        DEFAULT_COLLECT_PRICE,
        _WETH.address,
        _qVoteCollectModule.address,
        100,
        true,
        _roundImplementation.address,
        _votingStrategy.address,
      ]);

      await expect(_qVoteCollectModule.initializePublicationCollectModule(1, 1, collectModuleInitData)).to.not.be
        .reverted;
    });

    it("Should execute processCollect and vote", async function () {
      const DEFAULT_COLLECT_PRICE = ethers.utils.parseEther("1");
      expect(await _WETH.balanceOf(_userTwo.address)).to.be.eq(ethers.utils.parseEther("10"));
      const collectModuleInitData = getCollectModulePubInitData([
        DEFAULT_COLLECT_PRICE,
        _WETH.address,
        _user.address,
        100,
        true,
        _roundImplementation.address,
        _votingStrategy.address,
      ]);

      await expect(_qVoteCollectModule.initializePublicationCollectModule(1, 1, collectModuleInitData)).to.not.be
        .reverted;

      //start a round
      const currentBlockTimestamp = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

      await ethers.provider.send("evm_mine", [currentBlockTimestamp + 750]); /* wait for round to start */

      //encode collect call data
      const collectData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [_WETH.address, DEFAULT_COLLECT_PRICE],
      );

      await _WETH.connect(_userTwo).approve(_qVoteCollectModule.address, DEFAULT_COLLECT_PRICE);

      const tx = await _qVoteCollectModule.connect(_userTwo).processCollect(1, _userTwo.address, 1, 1, collectData);
      //const receipt = await tx.wait();

      await expect(tx).to.not.be.reverted;
    });

    it("Should execute processCollect with referral and vote", async function () {
      const DEFAULT_COLLECT_PRICE = ethers.utils.parseEther("1");
      expect(await _WETH.balanceOf(_userTwo.address)).to.be.eq(ethers.utils.parseEther("9"));
      const collectModuleInitData = getCollectModulePubInitData([
        DEFAULT_COLLECT_PRICE,
        _WETH.address,
        _user.address,
        100,
        true,
        _roundImplementation.address,
        _votingStrategy.address,
      ]);
      await expect(_qVoteCollectModule.initializePublicationCollectModule(1, 1, collectModuleInitData)).to.not.be
        .reverted;

      //await ethers.provider.send("evm_mine", [currentBlockTimestamp + 750]); /* wait for round to start */

      //encode collect call data
      const collectData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [_WETH.address, DEFAULT_COLLECT_PRICE],
      );

      await _WETH.connect(_userTwo).approve(_qVoteCollectModule.address, DEFAULT_COLLECT_PRICE);

      const tx = await _qVoteCollectModule.connect(_userTwo).processCollect(22, _userTwo.address, 1, 1, collectData);
      //const receipt = await tx.wait();

      await expect(tx).to.not.be.reverted;
    });
  });
}