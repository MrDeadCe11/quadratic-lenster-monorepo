import {
  AutotaskEvent,
  BlockTriggerEvent,
} from "defender-autotask-utils";
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import {ethers} from "ethers";
import axios from 'axios';
import roundImplementationAbi from "../../abi/RoundImplementation.json" assert {type: "json"};
import {RelayerParams} from "defender-relay-client";
import ERC721 from "../../abi/ERC721.json" assert {type: "json"};

const getProjectsMetaPtrQuery = `
  query GetProjectsMetaPtr($roundId: String) {
    round(id: $roundId) {
      id
      projectsMetaPtr {
        id
        protocol
        pointer
      }
    }
  }
`;

export async function handler(event: AutotaskEvent) {
  // Or if you know what type of sentinel you'll be using
  if (!event.request) {
    return "❌ No request found";
  }

  const {
    GRAPGHQL_ENDPOINT,
    PINATA_JWT,
  } = event.secrets || {} as Record<string, string | undefined>;

  // Contract Sentinel
  const contractPayload = event.request.body as BlockTriggerEvent;
  const {transaction, matchReasons} = contractPayload;

  // debug logs
  // console.log("ℹ️ Transaction: ", transaction);
  // console.log("ℹ️ matchReasons: ", matchReasons);


  const params = (matchReasons[0] as any).params as Record<string, string | undefined>
  const {roundAddress, projectId: accountId} = params;
  if (!roundAddress) {
    return "❌ Could not determine round address";
  }
  if (!accountId) {
    return "❌ Could not determine lens account id";
  }
  console.log("ℹ️ Round address", roundAddress);
  console.log("ℹ️ Owner ID", accountId);


  let currentProjectsMeta: ProjectMetaEntry[] = [];
  try {
    const currentProjectsMetaPtr = await axios.post<{
      data: {
        round: {
          id: string;
          projectsMetaPtr: {
            id: string;
            protocol: string;
            pointer: string;
          }
        }
      }
    }>(
      GRAPGHQL_ENDPOINT!,
      {query: getProjectsMetaPtrQuery, variables: {roundId: roundAddress.toLowerCase()}}
    ).then(async (response) => {
      return response.data.data.round;
    });
    if (currentProjectsMetaPtr) {
      currentProjectsMeta = await fetchFromIPFS<ProjectMetaEntry[]>(currentProjectsMetaPtr.projectsMetaPtr.pointer);
    }
  } catch (error) {
    return error;
  }

  console.log("ℹ️ Current projects meta:", currentProjectsMeta);
  const newProjectsMeta = [...currentProjectsMeta];

  // Check if user has already been added to applicants metadata
  const currentUserInProjects = newProjectsMeta.map(project => project.id).includes(accountId);
  if (currentUserInProjects) {
    return "💡 User already added to ptr, does not have to be added to metadata";
  }

  // Setup relay signer
  const provider = new DefenderRelayProvider(event as RelayerParams);
  const signer = new DefenderRelaySigner(event as RelayerParams, provider, {
    speed: "fast",
  });

  // User needs to be added to applicants, fetch payout address using account id
  const lensHubProxyAddress = transaction.to;
  console.log("ℹ️ Lens Hub Proxy Address", lensHubProxyAddress);
  const erc721Contract = new ethers.Contract(
    lensHubProxyAddress,
    ERC721,
    signer
  );

  const creatorAddress = await erc721Contract.ownerOf(accountId);
  console.log("ℹ️ Creator Address", creatorAddress);
  newProjectsMeta.push({
    payoutAddress: creatorAddress,
    id: accountId,
    status: "APPROVED"
  })

  // Create new applicants metadata
  console.log("ℹ️ New projects meta", newProjectsMeta);

  // Pin new metadata to IPFS
  const newPtr = await pinToIPFS({content: newProjectsMeta}, PINATA_JWT!);
  console.log('✅ Pinned new projects meta to ipfs', newPtr);

  // Update round meta pointer
  const cid = newPtr.IpfsHash;
  const newRoundMetaPr = {
    protocol: 1,
    pointer: cid,
  };
  const forwarder = new ethers.Contract(roundAddress, roundImplementationAbi, signer);
  const sentTx = await forwarder.updateProjectsMetaPtr(newRoundMetaPr);

  // Complete
  console.log(`✅ Sent tx: ${sentTx.hash}`);
  return `✅ Updated projectsMetaPtr in transaction ${sentTx.hash}`;
}


export const fetchFromIPFS = <T = unknown>(cid: string) => {
  return axios.get(
    // TODO: Use Pinata gateway
    `https://ipfs.io/ipfs/${cid}`
  ).then((resp) => {
    return resp.data as Promise<T>;
  });
};

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @param pinataJWT - the JTW for pinata to enable pinning
 * @returns the unique content identifier that points to the data
 */
export const pinToIPFS = (obj: any, pinataJWT: string) => {
  // content is a JSON object
  return axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {

      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1,
      }, pinataContent: obj.content
    }
    , {
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
        "Content-Type": "application/json",
      },
    }).then((resp) => {
    return resp.data
  });
};

export type ProjectMetaEntry = { id: string; payoutAddress: string; status: string };
const abi = `[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"address","name":"grantAddress","type":"address"},{"indexed":true,"internalType":"bytes32","name":"projectId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"roundAddress","type":"address"}],"name":"Voted","type":"event"},{"inputs":[],"name":"VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"roundAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"encodedVotes","type":"bytes[]"},{"internalType":"address","name":"relayerAddress","type":"address"}],"name":"vote","outputs":[],"stateMutability":"payable","type":"function"}]`
