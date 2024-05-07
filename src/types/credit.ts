export type CreditMetadata = {
  "project-name": string;
  "project-id": string;
  vintage: string;
  "project-developer": string;
  methodology: string;
  region: string;
  "project-type": string;
  standard: string;
  "crediting-period-start": Date;
  "crediting-period-end": Date;
  "issuance-date": Date;
  "credits-serial-number": string;
  "quantity-issue": string;
  "registry-reference-link": string;
  document: string;
};

export type CreditCore = {
  tokenId: number;
  initialOwner: string;
  approvalStatus: string;
  pricePerCredit: number;
  isListed: boolean;
  quantity: number;
  quantitySold: number;
  ownerCount: number;
  owners: string[];
  quantityOwned: number;
}

export type Credit = {
  metadata: CreditMetadata;
} & CreditCore;

// export type FileReq = {
//   bytes: Uint8Array;
//   fileName: string;
//   contentType: string;
// };

export type PinataRes = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};