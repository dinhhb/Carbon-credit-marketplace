// import { FileReq } from "@/types/credit";
import { NextRequest } from "next/server";
import { addressCheckMiddleware, pinataJWT } from "../utils";
import FormData from "form-data";
import { v4 as uuid4 } from "uuid";
import axios from "axios";

export async function POST(request: NextRequest) {
  const {
    bytes,
    fileName,
    contentType,
    signature,
    address,
  }: {
    bytes: Uint8Array;
    fileName: string;
    contentType: string;
    signature: string;
    address: string;
  } = await request.json();

  if (!bytes || !fileName || !contentType) {
    return new Response(JSON.stringify({ message: "File data is missing" }), {
      status: 422,
    });
  }

  await addressCheckMiddleware(signature, address);

  // Check if bytes is properly formatted as an object of numeric values
  const byteArray = Object.values(bytes).map((item) => {
    if (typeof item === "number") {
      return item;
    }
    throw new Error("Invalid byte data");
  });

  const buffer = Buffer.from(byteArray);
  const formData = new FormData();
  formData.append("file", buffer, {
    contentType,
    filename: fileName + "-" + uuid4(),
  });

  const fileRes = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxContentLength: Infinity,
      headers: {
        "Accept": "text/plain",
        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
        'Authorization': 'Bearer ' + pinataJWT
      },
    },
  );

  return new Response(JSON.stringify(fileRes.data), {
    status: 200,
  });
}
