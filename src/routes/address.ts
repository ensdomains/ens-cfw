import { IRequest, json } from "itty-router";
import { getAddress } from "viem/utils/address/getAddress";
import { Env } from "../types";
import { createClient } from "../utils/client";
import { wantedTexts } from "../utils/consts";
import { getName, getRecords } from "../utils/dynamic";
import { tryNormalise } from "../utils/tryNormalise";

const tryAddress = (address: string) => {
  try {
    return getAddress(address);
  } catch {
    return null;
  }
};

export const addressHandler = async ({ params }: IRequest, env: Env) => {
  const address = decodeURIComponent(params.address);
  const normalisedAddress = tryAddress(address);

  if (!normalisedAddress)
    return new Response("Invalid address", { status: 400 });

  const client = createClient(env);

  const primaryName = await getName(client, {
    address: normalisedAddress,
  });

  if (!primaryName || !primaryName.match || !primaryName.name)
    return new Response("No name found", { status: 404 });

  const name = primaryName.name;

  const normalisedName = await tryNormalise(name);
  if (!normalisedName) return new Response("Invalid name", { status: 400 });

  const records = await getRecords(client, {
    name: normalisedName,
    records: {
      texts: wantedTexts,
      coins: [60],
    },
  });

  if (!records) return new Response("No records found", { status: 404 });

  const result = {
    name: normalisedName,
    address: records.coins[0]?.value,
    texts: records.texts,
    coins: records.coins,
    resolverAddress: records.resolverAddress,
  };

  return json(result);
};
