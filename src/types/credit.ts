// export type CreditMetadata = {
//   "project-name": string;
//   "project-id": string;
//   vintage: string;
//   "project-developer": string;
//   methodology: string;
//   region: string;
//   "project-type": string;
//   standard: string;
//   "crediting-period-start": Date;
//   "crediting-period-end": Date;
//   "issuance-date": Date;
//   "credits-serial-number": string;
//   "quantity-issue": string;
//   price: string;
//   "registry-reference-link": string;
//   document: string;
// };

export type CreditMeta = {
  projectId: string;
  projectName: string;
  projectType: string;
  vintageFrom: string;
  vintageTo: string;
  origin: string;
  quantity: number;
  price: number;
  registryLink: string;
  registryAccountName: string;
  registryAccountNo: string;
  document: string;
  standard: string;
}

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
  metadata: CreditMeta;
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