import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided. Please set NEXT_PUBLIC_CLIENT_ID in your environment variables.");
}

export const client = createThirdwebClient({ clientId: clientId });
