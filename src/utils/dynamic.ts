import type { GetNameParameters } from "@ensdomains/ensjs/functions/public/getName";
import type {
  GetRecordsParameters,
  GetRecordsReturnType,
} from "@ensdomains/ensjs/functions/public/getRecords";
import type { createClient } from "./client";

type Client = ReturnType<typeof createClient>;

export const getRecords = async <T extends GetRecordsParameters>(
  client: Client,
  args: T
) =>
  await import("@ensdomains/ensjs/functions/public/getRecords").then(
    (m) => m.default(client as any, args) as Promise<GetRecordsReturnType<T>>
  );

export const getName = async (client: Client, args: GetNameParameters) =>
  await import("@ensdomains/ensjs/functions/public/getName").then((m) =>
    m.default(client as any, args)
  );
