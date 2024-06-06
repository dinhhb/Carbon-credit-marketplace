import { Credit } from "./credit";

export type RetirementMeta = {
  amount: number;
  beneficialOwner: string;
  retirementReason: string;
  retirementReasonDetails: string;
  credit: Credit;
}

export type RetirementCore = {
  retirementId: number;
  amount: number;
  owner: string;
  projectId: number;
  time: number;
}

export type Retirement = {
  metadata: RetirementMeta;
} & RetirementCore;