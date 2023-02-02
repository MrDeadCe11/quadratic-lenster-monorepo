import { ADMIN_API_KEY, ADMIN_API_SECRET } from "./constants.js";
import { RelayClient } from "defender-relay-client";

const creds = { apiKey: ADMIN_API_KEY, apiSecret: ADMIN_API_SECRET };
const client = new RelayClient(creds);

const listRelays = async () => {
  await client.list().then((res) => console.log(res));
};

listRelays();