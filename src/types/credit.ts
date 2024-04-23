export type CreditMetadata = {
  "project-name": string;
  "project-id": string;
  vintage: number;
  "project-developer": string;
  methodology: string;
  region: string;
  "project-type": string;
  standard: string;
  "crediting-period-start": Date;
  "crediting-period-end": Date;
  "issuance-date": Date;
  "credits-serial-number": string;
  "quantity-issue": number;
  "registry-reference-link": string;
};

export type CreditCore = {
  tokenId: number;
  initialOwner: string;
  approvalStatus: string;
  pricePerCredit: number;
  isListed: boolean;
  // quantity: number;
}

export type Credit = {
  metadata: CreditMetadata;
} & CreditCore;
