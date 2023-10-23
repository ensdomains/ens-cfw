// eslint-disable-next-line import/no-extraneous-dependencies
import { error } from "itty-router";
import { IRequest, Router } from "itty-router/Router";
import { createCors } from "itty-router/createCors";
import { addressHandler } from "./routes/address";
import { nameHandler } from "./routes/name";
import { Env } from "./types";

const { corsify } = createCors({
  origins: ["*"],
  methods: ["GET", "OPTIONS"],
  headers: ["Content-Type"],
  maxAge: 30,
});

const router = Router<IRequest, [Env]>();
router.get("/name/:name", nameHandler);
router.get("/address/:address", addressHandler);

const main = async (request: Request, env: Env, ctx: ExecutionContext) => {
  const start = performance.now();

  const cache = caches.default;
  const cacheKey = request.url;

  let response = await cache.match(cacheKey);

  if (!response) {
    const result: Response = await router.handle(request, env);
    result.headers.append("Cache-Control", "s-maxage=30");
    ctx.waitUntil(cache.put(cacheKey, result.clone()));
    response = result;
  } else {
    console.log(`Cache hit - ${cacheKey}`);
  }

  const end = performance.now();

  console.log(`Returned in ${end - start}ms - ${cacheKey}`);

  return response;
};

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) =>
    main(request, env, ctx).catch(error).then(corsify),
};
