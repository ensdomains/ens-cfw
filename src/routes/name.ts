import { IRequest, json } from "itty-router";
import { Env } from "../types";
import { createClient } from "../utils/client";
import { wantedTexts } from "../utils/consts";
import { getRecords } from "../utils/dynamic";
import { tryNormalise } from "../utils/tryNormalise";

export const nameHandler = async ({ params }: IRequest, env: Env) => {
  const name = decodeURIComponent(params.name);
  if (!name) {
    return new Response("No name provided", { status: 400 });
  }

  const normalisedName = await tryNormalise(name);
  if (!normalisedName) return new Response("Invalid name", { status: 400 });

  const client = createClient(env);

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
