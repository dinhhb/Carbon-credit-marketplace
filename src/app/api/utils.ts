// import { withIronSession } from "next-iron-session";
import { SessionOptions, getIronSession } from "iron-session";
import marketContract from "../../../public/contracts/CarbonMarket.json";
import tokenContract from "../../../public/contracts/CarbonToken.json";
import projectContract from "../../../public/contracts/ProjectManagement.json";
import { cookies } from "next/headers";
import { ethers } from "ethers";
import { ProjectManagementContract } from "@/types/ProjectManagementContract";
import * as util from "ethereumjs-util";

const NETWORKS = {
  "5777": "Ganache",
};

type NETWORKS = typeof NETWORKS;

const abi = projectContract.abi;
const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORKS;

export const tokenContractAddress =
  tokenContract["networks"][targetNetwork]["address"];
export const marketContractAddress =
  marketContract["networks"][targetNetwork]["address"];
export const projectContractAddress =
  projectContract["networks"][targetNetwork]["address"];

export const pinataJWT = process.env.PINATA_JWT as string;

export interface SessionData {
  message: { projectContractAddress: string; id: string };
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "credit-auth-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production" ? true : false,
  },
};

export const addressCheckMiddleware = async (
  signature: string,
  address: string,
) => {
  return new Promise(async (resolve, reject) => {
    const session = await getIronSession<SessionData>(
      cookies(),
      sessionOptions,
    );
    const message = session.message;

    // THE COMMENTED CODE BELOW IS FOR ADDING MORE FUNCTIONALITY (VERIFY ADDRESS CAN REGISTER CREDIT, ...)

    // const provider = new ethers.providers.JsonRpcProvider({
    //   url: "http://127.0.0.1:7545",
    //   skipFetchSetup: true,
    // });

    // try {
    //   const blockNumber = await provider.getBlockNumber();
    //   console.log(
    //     "Successfully connected to network. Current block number:",
    //     blockNumber,
    //   );
    // } catch (error) {
    //   console.error("Failed to connect to network:", error);
    // }

    // const contract = new ethers.Contract(
    //   projectContractAddress,
    //   abi,
    //   provider,
    // ) as unknown as ProjectManagementContract;

    let nonce: string | Buffer =
      "\x19Ethereum Signed Message:\n" +
      JSON.stringify(message).length +
      JSON.stringify(message);

    nonce = util.keccak256(Buffer.from(nonce, "utf-8"));
    const { v, r, s } = util.fromRpcSig(signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuf = util.pubToAddress(pubKey);
    const addr = util.bufferToHex(addrBuf);

    if (addr === address) {
      resolve("Correct address");
    } else {
      reject("Incorrect address");
    }
  });
};
