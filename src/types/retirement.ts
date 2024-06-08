import { Credit } from "./credit";

export type RetirementMeta = {
  amount: number;
  beneficialOwner: string;
  retirementReason: string;
  retirementReasonDetails: string;
  document: string;
  credit: Credit;
}

export type RetirementCore = {
  retirementId: number;
  amount: number;
  owner: string;
  projectId: number;
  time: number;
  isCertificated: boolean;
}

export type Retirement = {
  metadata: RetirementMeta;
} & RetirementCore;