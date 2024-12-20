import { simulatePreview } from '@/lib/actions';
import { AccountSummary, ExtendedBankInfo, ActionType } from '@/lib/mrgnlend';
import { Account } from '@/types/account';

export interface SimulatedActionPreview {
  health: string;
  liquidationPrice?: string | null;
  depositRate: string;
  borrowRate: string;
  positionAmount: string;
  availableCollateral: {
    ratio: string;
    amount: string;
  };
  accountSummary?: AccountSummary;
}

export async function calculateActionPreview({
  selectedAccount,
  bank,
  actionMode,
  amount,
}: {
  selectedAccount: Account;
  bank: ExtendedBankInfo;
  actionMode: ActionType;
  amount: string;
}): Promise<SimulatedActionPreview | null> {
  try {
    const result = await simulatePreview(
      selectedAccount.id,
      bank.bankId,
      amount,
      actionMode,
    );
    return result;
  } catch (error) {
    return null;
  }
}
