export type CarbonCreditCreatedEvent = {
  tokenId: number;
  initialOwner: string;
  amount: number;
  creationTime: number;
};

export type CarbonCreditAuditedEvent = {
  tokenId: number;
  auditor: string;
  projectOwner: string;
  status: number;
  time: number;
};

export type CarbonCreditListedEvent = {
  tokenId: number;
  initialOwner: string;
  amount: number;
  pricePerCredit: number;
  time: number;
};

export type CarbonCreditPurchasedEvent = {
  tokenId: number;
  from: string;
  to: string;
  amount: number;
  time: number;
};

export type CarbonCreditRetiredEvent = {
  tokenId: number;
  owner: string;
  amount: number;
  time: number;
};