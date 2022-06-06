import { utils } from "ethers";
import { namehash } from "ethers/lib/utils";
import type { Request as IttyRequest } from "itty-router";
import { Router } from "itty-router";

const router = Router();

const ensAddress = "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e";

const handleFetch = async (address: string, data: string) => {
  return await fetch("https://cloudflare-eth.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: address,
          data,
        },
        "latest",
      ],
      id: 1,
    }),
  }).then((res) => res.json());
};

const getAddressFromName = async (name: string) => {
  const hash = namehash(name).substring(2);
  const resolver: any = await handleFetch(ensAddress, "0x0178b8bf" + hash);
  const resolverAddress = utils.defaultAbiCoder.decode(
    ["address"],
    resolver.result
  )[0];
  const addr: any = await handleFetch(resolverAddress, "0x3b3b57de" + hash);
  const formattedAddr = utils.defaultAbiCoder.decode(
    ["address"],
    addr.result
  )[0];
  return formattedAddr;
};

const getNameFromAddress = async (address: string) => {
  const reverseNode = address.substring(2) + ".addr.reverse";
  const hash = namehash(reverseNode).substring(2);
  const resolver: any = await handleFetch(ensAddress, "0x0178b8bf" + hash);
  const resolverAddress = utils.defaultAbiCoder.decode(
    ["address"],
    resolver.result
  )[0];
  const name: any = await handleFetch(resolverAddress, "0x691f3431" + hash);
  const formattedName = utils.defaultAbiCoder.decode(
    ["string"],
    name.result
  )[0];
  return formattedName;
};

router.get(
  "/address/from/:name",
  async ({ params }: IttyRequest & { params: { name: string } }) => {
    const input = decodeURIComponent(params.name);
    const time = Date.now();
    const address = await getAddressFromName(input);
    console.log(Date.now() - time);
    return new Response(
      JSON.stringify({
        address,
      })
    );
  }
);

router.get(
  "/name/from/:address",
  async ({ params }: IttyRequest & { params: { address: string } }) => {
    const input = decodeURIComponent(params.address);
    const time = Date.now();
    const name = await getNameFromAddress(input);
    const forwardAddress = await getAddressFromName(name);
    console.log(Date.now() - time);
    return new Response(
      JSON.stringify({
        name,
        match:
          forwardAddress &&
          forwardAddress.toLowerCase() === input.toLowerCase(),
      })
    );
  }
);

router.all("*", () => new Response("Not Found.", { status: 404 }));

addEventListener("fetch", (event) => {
  event.respondWith(router.handle(event.request));
});
