import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { QuadraticVoteCollectModule } from "../../types/contracts/QuadraticVoteCollectModule";
import { ERC20 } from "../../types/contracts/mocks/ERC20";
import { ProfileCreationProxy } from "../../types/contracts/mocks/ProfileCreationProxy";
import { QuadraticFundingRelayStrategyImplementation } from "../../types/contracts/mocks/QuadraticFundingRelayStrategyImplementation";
import { RoundImplementation } from "../../types/contracts/mocks/RoundImplementation";
import { deployGitcoinMumbaiFixture } from "../gitcoinTests/gitcoin.fixture";
import { buildPostData, getDefaultSigners } from "../utils/utils";

export function shouldBehaveLikeQFCollectionModule() {
  let signers: { [key: string]: SignerWithAddress };
  let _qVoteCollectModule: QuadraticVoteCollectModule;
  let _WMATIC: ERC20;
  let _roundImplementation: RoundImplementation;
  let _votingStrategy: QuadraticFundingRelayStrategyImplementation;
  let _currentBlockTimestamp: number;

  let _lensHub: any;
  let _moduleGlobals: any;
  let _profileCreation: ProfileCreationProxy;
  let _profiles: any;

  beforeEach("setup test", async function () {
    signers = await getDefaultSigners();

    // deploy gitcoin fixture
    const {
      qVoteCollectModule,
      roundImplementation,
      WETH,
      votingStrategy,
      currentBlockTimestamp,
      lensHub,
      moduleGlobals,
      profileCreation,
      profiles,
    } = await loadFixture(deployGitcoinMumbaiFixture);

    _qVoteCollectModule = qVoteCollectModule;
    _WMATIC = WETH;
    _roundImplementation = roundImplementation;
    _votingStrategy = votingStrategy;
    _currentBlockTimestamp = currentBlockTimestamp;
    _moduleGlobals = moduleGlobals;
    _profileCreation = profileCreation;
    _profiles = profiles;
    _lensHub = lensHub;
  });

  it("Should collect a post and simultaneously vote in an active round", async function () {
    const { admin, grant } = signers;
    const { creator, collector } = _profiles;
    const voteAmount = ethers.utils.parseEther("2");

    // Currency is ERC20 and whitelisted

    expect(await _moduleGlobals.isCurrencyWhitelisted(_WMATIC.address)).to.be.eq(true);
    expect(ethers.utils.formatEther(await _WMATIC.balanceOf(collector.account.address))).to.equal("10.0");
    await _WMATIC.connect(collector.account).approve(_votingStrategy.address, voteAmount);
    await _WMATIC.connect(collector.account).approve(_qVoteCollectModule.address, voteAmount);

    // We can cast a Vote in a Grants Round

    // Prepare Votes

    const votes = [
      [collector.account.address, _WMATIC.address, voteAmount, grant.address, ethers.utils.id("testProject")],
    ];
    const encodedVotes = votes.map((vote) =>
      ethers.utils.defaultAbiCoder.encode(["address", "address", "uint256", "address", "bytes32"], vote),
    );

    await ethers.provider.send("evm_mine", [_currentBlockTimestamp + 750]); /* wait for round to start */

    await expect(_roundImplementation.connect(collector.account).vote(encodedVotes)).to.emit(_votingStrategy, "Voted");

    // // We can whitelist a Collect module

    //TODO test for emitted event
    await expect(_lensHub.connect(admin).whitelistCollectModule(_qVoteCollectModule.address, true)).to.not.be.reverted;
    expect(await _lensHub.isCollectModuleWhitelisted(_qVoteCollectModule.address)).to.be.true;

    // We can create a post that uses our collect module

    const _initData = [_WMATIC.address, 0, _roundImplementation.address, _votingStrategy.address];
    const initQFCollect = ethers.utils.defaultAbiCoder.encode(["address", "uint16", "address", "address"], _initData);
    const postData = buildPostData(1, _qVoteCollectModule.address, initQFCollect);

    await expect(_lensHub.connect(creator.account).post(postData)).to.not.be.reverted;

    // We can collect a post as a second user that triggers the collect module

    //TODO continue testing
    expect(await _lensHub.connect(collector.account).collect(1, 1, [])).to.eq(1);
  });
}
