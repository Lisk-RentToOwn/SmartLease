import * as PushAPI from '@pushprotocol/restapi';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';
import { ethers } from 'ethers';

// Your Push Channel's PRIVATE KEY (never expose this in frontend)
const CHANNEL_PK = process.env.PUSH_CHANNEL_PK!;

export async function sendPushNotification({
  title,
  body,
  recipient,
}: {
  title: string;
  body: string;
  recipient: string;
}) {
  if (!CHANNEL_PK) throw new Error("PUSH_CHANNEL_PK is not set in env");
  
  try {
    const signer = new ethers.Wallet(CHANNEL_PK); // Using ethers.js wallet as signer

    await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // direct
      identityType: 2, // direct payload
      notification: {
        title,
        body,
      },
      payload: {
        title,
        body,
        cta: '',
        img: '',
      },
      recipients: `eip155:11155111:${recipient}`, // assuming Sepolia
      channel: `eip155:11155111:${signer.address}`,
      env: ENV.PROD,
    });
  } catch (err) {
    console.error('❌ Push notification failed:', err);
  }
}

export const fetchUserNotifications = async (walletAddress: string) => {
  return await PushAPI.user.getFeeds({
    user: `eip155:1:${walletAddress}`, // assumes Ethereum mainnet, adjust if needed
    env: ENV.DEV,
  });
};