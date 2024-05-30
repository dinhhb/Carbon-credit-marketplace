import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  AccountManagementContract,
  AccountManagementContractMethodNames,
  AccountManagementContractEventsContext,
  AccountManagementContractEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type AccountManagementContractEvents =
  | 'ApprovalForAll'
  | 'CarbonCreditAudited'
  | 'CarbonCreditCreated'
  | 'CarbonCreditListed'
  | 'CarbonCreditPurchased'
  | 'CarbonCreditRetired'
  | 'OwnershipTransferred'
  | 'TransferBatch'
  | 'TransferSingle'
  | 'URI';
export interface AccountManagementContractEventsContext {
  ApprovalForAll(...parameters: any): EventFilter;
  CarbonCreditAudited(...parameters: any): EventFilter;
  CarbonCreditCreated(...parameters: any): EventFilter;
  CarbonCreditListed(...parameters: any): EventFilter;
  CarbonCreditPurchased(...parameters: any): EventFilter;
  CarbonCreditRetired(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  TransferBatch(...parameters: any): EventFilter;
  TransferSingle(...parameters: any): EventFilter;
  URI(...parameters: any): EventFilter;
}
export type AccountManagementContractMethodNames =
  | 'new'
  | 'balanceOf'
  | 'balanceOfBatch'
  | 'burn'
  | 'burnBatch'
  | 'isApprovedForAll'
  | 'owner'
  | 'renounceOwnership'
  | 'safeBatchTransferFrom'
  | 'safeTransferFrom'
  | 'setApprovalForAll'
  | 'supportsInterface'
  | 'transferOwnership'
  | 'uri'
  | 'setAuthorizedContract'
  | 'checkAccountRegistered'
  | 'getAccountTotalCredits'
  | 'setAccountTotalCredits'
  | 'getAccountTotalRetire'
  | 'setAccountTotalRetire'
  | 'getAccountIdsCount'
  | 'isAuditor'
  | 'getAccountByIndex'
  | 'getAccountByAddress'
  | 'getAllAccounts'
  | 'registerAccount'
  | 'removeAccount';
export interface ApprovalForAllEventEmittedResponse {
  account: string;
  operator: string;
  approved: boolean;
}
export interface CarbonCreditAuditedEventEmittedResponse {
  tokenId: BigNumberish;
  auditor: string;
  projectOwner: string;
  status: BigNumberish;
  time: BigNumberish;
}
export interface CarbonCreditCreatedEventEmittedResponse {
  tokenId: BigNumberish;
  initialOwner: string;
  amount: BigNumberish;
  creationTime: BigNumberish;
}
export interface CarbonCreditListedEventEmittedResponse {
  tokenId: BigNumberish;
  initialOwner: string;
  amount: BigNumberish;
  pricePerCredit: BigNumberish;
  time: BigNumberish;
}
export interface CarbonCreditPurchasedEventEmittedResponse {
  tokenId: BigNumberish;
  from: string;
  to: string;
  amount: BigNumberish;
  time: BigNumberish;
}
export interface CarbonCreditRetiredEventEmittedResponse {
  tokenId: BigNumberish;
  owner: string;
  amount: BigNumberish;
  time: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface TransferBatchEventEmittedResponse {
  operator: string;
  from: string;
  to: string;
  ids: BigNumberish[];
  values: BigNumberish[];
}
export interface TransferSingleEventEmittedResponse {
  operator: string;
  from: string;
  to: string;
  id: BigNumberish;
  value: BigNumberish;
}
export interface URIEventEmittedResponse {
  value: string;
  id: BigNumberish;
}
export interface AccountResponse {
  addr: string;
  0: string;
  totalCredits: BigNumber;
  1: BigNumber;
  totalRetire: BigNumber;
  2: BigNumber;
  isAuditor: boolean;
  3: boolean;
  registeredAt: BigNumber;
  4: BigNumber;
}
export interface AccountManagementContract {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _tokenAddress Type: address, Indexed: false
   */
  'new'(
    _tokenAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   * @param id Type: uint256, Indexed: false
   */
  balanceOf(
    account: string,
    id: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param accounts Type: address[], Indexed: false
   * @param ids Type: uint256[], Indexed: false
   */
  balanceOfBatch(
    accounts: string[],
    ids: BigNumberish[],
    overrides?: ContractCallOverrides
  ): Promise<BigNumber[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param id Type: uint256, Indexed: false
   * @param value Type: uint256, Indexed: false
   */
  burn(
    account: string,
    id: BigNumberish,
    value: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param ids Type: uint256[], Indexed: false
   * @param values Type: uint256[], Indexed: false
   */
  burnBatch(
    account: string,
    ids: BigNumberish[],
    values: BigNumberish[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   * @param operator Type: address, Indexed: false
   */
  isApprovedForAll(
    account: string,
    operator: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param ids Type: uint256[], Indexed: false
   * @param amounts Type: uint256[], Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  safeBatchTransferFrom(
    from: string,
    to: string,
    ids: BigNumberish[],
    amounts: BigNumberish[],
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param id Type: uint256, Indexed: false
   * @param amount Type: uint256, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    id: BigNumberish,
    amount: BigNumberish,
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param operator Type: address, Indexed: false
   * @param approved Type: bool, Indexed: false
   */
  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param interfaceId Type: bytes4, Indexed: false
   */
  supportsInterface(
    interfaceId: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(
    newOwner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  uri(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _authorizedContract Type: address, Indexed: false
   */
  setAuthorizedContract(
    _authorizedContract: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  checkAccountRegistered(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  getAccountTotalCredits(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param totalCredits Type: uint256, Indexed: false
   */
  setAccountTotalCredits(
    account: string,
    totalCredits: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  getAccountTotalRetire(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param totalRetire Type: uint256, Indexed: false
   */
  setAccountTotalRetire(
    account: string,
    totalRetire: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getAccountIdsCount(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param auditor Type: address, Indexed: false
   */
  isAuditor(
    auditor: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint256, Indexed: false
   */
  getAccountByIndex(
    index: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  getAccountByAddress(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<AccountResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getAllAccounts(overrides?: ContractCallOverrides): Promise<AccountResponse[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   * @param totalCredits Type: uint256, Indexed: false
   * @param isAudit Type: bool, Indexed: false
   */
  registerAccount(
    account: string,
    totalCredits: BigNumberish,
    isAudit: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param addr Type: address, Indexed: false
   */
  removeAccount(
    addr: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
}
