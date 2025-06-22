import { PushAPI } from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";

export async function createPushUser(signer: any) {
  return await PushAPI.initialize(signer, { env: ENV.DEV });
}