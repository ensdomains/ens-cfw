import { addEnsContracts } from "@ensdomains/ensjs/contracts/addEnsContracts";
import type { mainnet as mainnetT } from "viem/chains";
import { mainnet } from "viem/chains/definitions/mainnet";
import type { Chain } from "viem/chains/index";
import type { Client } from "viem/clients/createClient";
import { createClient as createClientViem } from "viem/clients/createClient";
import type { HttpTransport } from "viem/clients/transports/http";
import { http } from "viem/clients/transports/http";
import { Env } from "../types";

export const createClient = (env: Env) =>
  createClientViem({
    chain: addEnsContracts(mainnet as typeof mainnetT) as Chain,
    transport: http(env.ETH_ENDPOINT),
  }) as Client<HttpTransport, any>;
