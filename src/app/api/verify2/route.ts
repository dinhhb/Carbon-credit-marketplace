import { v4 as uuid4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import {
  SessionData,
  addressCheckMiddleware,
  pinataJWT,
  projectContractAddress,
  sessionOptions,
} from "../utils";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import axios from "axios";
import { RetirementMeta } from "@/types/retirement";

export async function GET() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  try {
    const message = { projectContractAddress, id: uuid4() };
    session.message = message;
    await session.save();
    // console.log("message", message);
    return Response.json(message);
  } catch {
    return new Response(
      JSON.stringify({ message: "Cannot generate a message" }),
      { status: 422 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      retirement,
      signature,
      address,
    }: { retirement: RetirementMeta; signature: string; address: string } =
      await request.json();

    const requiredFields: Array<keyof RetirementMeta> = [
      "amount",
      "beneficialOwner",
      "retirementReason",
      "retirementReasonDetails",
    ];

    for (let field of requiredFields) {
      if (!retirement[field]) {
        return new Response(
          JSON.stringify({
            message: "Some of the form data are missing",
            field,
          }),
          {
            status: 422,
          },
        );
      }
    }

    await addressCheckMiddleware(signature, address);

    const jsonRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataMetadata: {
          name: uuid4(),
        },
        pinataContent: retirement,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + pinataJWT
        },
      },
    );
    
    return new Response(JSON.stringify(jsonRes.data), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ message: "Cannot process request" }), {
      status: 422,
    });
  }
}
