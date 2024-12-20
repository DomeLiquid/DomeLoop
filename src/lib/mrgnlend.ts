import {
  BalanceWithLendingPosition,
  BankWithState,
  Chain,
  UserAssetAmount,
} from '@/types/account';
import { TokenData } from '@/types/type';

const DEFAULT_ACCOUNT_SUMMARY: AccountSummary = {
  healthFactor: 0,
  balance: 0,
  lendingAmount: 0,
  borrowingAmount: 0,
  apy: 0,
  outstandingUxpEmissions: 0,
  balanceUnbiased: 0,
  lendingAmountUnbiased: 0,
  borrowingAmountUnbiased: 0,
  lendingAmountWithBiasAndWeighted: 0,
  borrowingAmountWithBiasAndWeighted: 0,
  signedFreeCollateral: 0,
};

function getCurrentAction(
  isLendingMode: boolean,
  bank: ExtendedBankInfo,
): ActionType {
  if (!bank.isActive) {
    return isLendingMode ? ActionType.Deposit : ActionType.Borrow;
  } else {
    if (
      !isLendingMode &&
      bank.balanceWithLendingPosition?.position?.isLending === false &&
      bank.balanceWithLendingPosition?.position?.amount > 0.00000001
    ) {
      return ActionType.Borrow;
    }

    if (
      !isLendingMode &&
      bank.balanceWithLendingPosition?.position?.isLending === true &&
      bank.balanceWithLendingPosition?.position?.amount > 0.00000001
    ) {
      return ActionType.Withdraw;
    }

    if (
      bank.balanceWithLendingPosition?.position?.isLending === isLendingMode
    ) {
      if (isLendingMode) {
        return ActionType.Deposit;
      } else {
        return ActionType.Withdraw;
      }
    } else {
      if (isLendingMode) {
        return ActionType.Repay;
      } else {
        return ActionType.Borrow;
      }
    }
  }
}

function makeExtendedBankInfo(
  bankWithState: BankWithState,
  tokenWithPriceMetadata: TokenWithPriceMetadata,
  balanceWithLendingPosition?: BalanceWithLendingPosition,
  emissionTokenWithPriceMetadata?: TokenWithPriceMetadata,
  assetAmountMap?: Map<string, number>,
): ExtendedBankInfo {
  let walletBalance = assetAmountMap?.get(bankWithState.mixinSafeAssetId) ?? 0;

  let maxDeposit = Math.max(
    0,
    Math.min(walletBalance, bankWithState.state.depositCapLeft),
  );
  let maxBorrow = Math.min(
    bankWithState.state.borrowCapLeft,
    bankWithState.state.availableLiquidity,
  );

  if (
    !balanceWithLendingPosition ||
    !balanceWithLendingPosition?.position ||
    balanceWithLendingPosition.lastUpdate === 0
  ) {
    return {
      bankId: bankWithState.id,
      token: tokenWithPriceMetadata,
      info: bankWithState,
      isActive: false,
      userInfo: {
        userAssetAmount: assetAmountMap?.get(bankWithState.mixinSafeAssetId)
          ? {
              assetId: bankWithState.mixinSafeAssetId,
              amount: assetAmountMap.get(bankWithState.mixinSafeAssetId) ?? 0,
            }
          : undefined,
        maxDeposit: maxDeposit,
        maxRepay: 0,
        maxWithdraw: 0,
        maxBorrow: maxBorrow,
      },
    };
  }

  const maxWithdraw = Math.min(
    bankWithState.state.availableLiquidity,
    balanceWithLendingPosition.position?.isLending
      ? balanceWithLendingPosition.position?.amount ?? 0
      : 0,
  );

  const maxRepay = Math.min(
    walletBalance,
    balanceWithLendingPosition.position?.isLending
      ? 0
      : balanceWithLendingPosition.position?.amount ?? 0,
  );

  return {
    bankId: bankWithState.id,
    token: tokenWithPriceMetadata,
    info: bankWithState,
    isActive: true,
    balanceWithLendingPosition: balanceWithLendingPosition,
    emissionTokenWithPriceMetadata: emissionTokenWithPriceMetadata,
    userInfo: {
      userAssetAmount: assetAmountMap?.get(bankWithState.mixinSafeAssetId)
        ? {
            assetId: bankWithState.mixinSafeAssetId,
            amount: assetAmountMap.get(bankWithState.mixinSafeAssetId) ?? 0,
          }
        : undefined,
      maxDeposit: maxDeposit,
      maxRepay: maxRepay,
      maxWithdraw: maxWithdraw,
      maxBorrow: maxBorrow,
    },
  };
}

export { DEFAULT_ACCOUNT_SUMMARY };

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface BankMetadataMap {
  [key: string]: BankMetadata;
}

interface BankMetadata {
  id: string;
  mixinAssetId: string;
}

interface TokenWithPriceMetadata {
  price: number;
  priceHighest: number;
  priceLowest: number;

  assetId: string;
  chainId: string;
  symbol: string;
  name: string;
  iconUrl: string;
  chain: Chain;
}

interface TokenDataMap {
  [key: string]: TokenData;
}

interface TokenWithPriceMetadataMap {
  [key: string]: TokenWithPriceMetadata;
}

interface BalanceWithLendingPositionMap {
  [key: string]: BalanceWithLendingPosition; // key is bankId
}

interface AccountSummary {
  healthFactor: number;
  balance: number;
  lendingAmount: number;
  borrowingAmount: number;
  apy: number;
  outstandingUxpEmissions: number;
  balanceUnbiased: number;
  lendingAmountUnbiased: number;
  borrowingAmountUnbiased: number;
  lendingAmountWithBiasAndWeighted: number;
  borrowingAmountWithBiasAndWeighted: number;
  signedFreeCollateral: number;
}

// interface TokenPriceMap {
//   [key: string]: TokenPrice;
// }

// interface TokenPrice {
//   price: number;
// }

// interface ExtendedBankMetadata {
//   bankId: string;
//   tokenWithPriceMetadata: TokenWithPriceMetadata;
// }

interface BankState {
  lendingRate: number;
  borrowingRate: number;
  emissionsRate: number;
  emissions: Emissions;
  totalDeposits: number;
  depositCap: number;
  totalBorrows: number;
  borrowCap: number;
  depositCapLeft: number; // 存款上限剩余
  borrowCapLeft: number; // 借款上限剩余
  availableLiquidity: number;
  utilizationRate: number;
  isIsolated: boolean;
}

interface LendingPosition {
  isLending: boolean;
  amount: number;
  usdValue: number;
  // weightedUSDValue: number;
  liquidationPrice: number | null;
  isDust: false;
}

interface UserInfo {
  userAssetAmount?: UserAssetAmount;
  maxDeposit: number;
  maxRepay: number;
  maxWithdraw: number;
  maxBorrow: number;
}

interface InactiveBankInfo {
  bankId: string;
  // meta: ExtendedBankMetadata;
  userInfo: UserInfo;
  token: TokenWithPriceMetadata;
  info: BankWithState;
  isActive: false;
  // userInfo: UserInfo;
}

interface ActiveBankInfo {
  bankId: string;
  // meta: ExtendedBankMetadata;
  token: TokenWithPriceMetadata;
  info: BankWithState;
  userInfo: UserInfo;
  isActive: true;
  balanceWithLendingPosition: BalanceWithLendingPosition;
  emissionTokenWithPriceMetadata?: TokenWithPriceMetadata;
  // userInfo: UserInfo;
  // position: LendingPosition;
}

type ExtendedBankInfo = ActiveBankInfo | InactiveBankInfo;

enum Emissions {
  Inactive,
  Lending,
  Borrowing,
}

enum ActionType {
  Deposit = 'Supply',
  Borrow = 'Borrow',
  Repay = 'Repay',
  Withdraw = 'Withdraw',
  Loop = 'Loop',
}

enum RepayType {
  RepayRaw = 'Repay',
  //   RepayCollat = 'Collateral Repay',
}

type ActionMethodType = 'WARNING' | 'ERROR' | 'INFO';
interface ActionMethod {
  isEnabled: boolean;
  actionMethod?: ActionMethodType;
  description?: string;
  link?: string;
  linkText?: string;
  action?: {
    bank: ExtendedBankInfo;
    type: ActionType;
  };
}

export {
  Emissions,
  ActionType,
  RepayType,
  makeExtendedBankInfo,
  getCurrentAction,
  // makeExtendedBankMetadata,
};
export type {
  BalanceWithLendingPositionMap,
  AccountSummary,
  LendingPosition,
  // ExtendedBankMetadata,
  ActiveBankInfo,
  InactiveBankInfo,
  ExtendedBankInfo,
  BankState,
  ActionMethod,
  ActionMethodType,
  BankMetadataMap,
  BankMetadata,
  TokenDataMap,
  TokenWithPriceMetadataMap,
  TokenWithPriceMetadata,
};
