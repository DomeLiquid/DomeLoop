import React from 'react';

import { ExtendedBankInfo } from '@/lib/mrgnlend';
import { ActionType } from '@/lib/mrgnlend';
import { Input } from '@/components/ui/input';
import { BankSelect } from './components/bank-select';
import { LendingAction } from './components/lending-action';
import { formatAmount } from '../../utils/mrgnUtils';

type ActionInputProps = {
  amountRaw: string;
  walletAmount: number | undefined;
  maxAmount: number;
  banks: ExtendedBankInfo[];
  selectedBank: ExtendedBankInfo | null;
  lendMode: ActionType;

  connected: boolean;
  showCloseBalance?: boolean;
  isDialog?: boolean;
  isMini?: boolean;

  setAmountRaw: (amount: string) => void;
  setSelectedBank: (bank: ExtendedBankInfo | null) => void;
};

export const ActionInput = ({
  banks,
  walletAmount,
  maxAmount,
  showCloseBalance,
  connected,
  isDialog,

  amountRaw,
  selectedBank,
  lendMode,
  setAmountRaw,
  setSelectedBank,
}: ActionInputProps) => {
  const amountInputRef = React.useRef<HTMLInputElement>(null);

  const numberFormater = React.useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }),
    [],
  );

  // const isInputDisabled = React.useMemo(
  //   () => maxAmount === 0 && !showCloseBalance,
  //   [maxAmount, showCloseBalance],
  // );
  const isInputDisabled = false;
  const formatAmountCb = React.useCallback(
    (newAmount: string, bank: ExtendedBankInfo | null) => {
      return formatAmount(newAmount, maxAmount, bank, numberFormater);
    },
    [maxAmount, numberFormater],
  );

  const handleInputChange = React.useCallback(
    (newAmount: string) => {
      setAmountRaw(formatAmountCb(newAmount, selectedBank));
    },
    [formatAmountCb, setAmountRaw, selectedBank],
  );

  return (
    <div className="rounded-lg bg-background p-2.5">
      <div className="flex items-center justify-center gap-1 text-3xl font-medium">
        <div className="w-full max-w-[162px] flex-auto">
          <BankSelect
            selectedBank={selectedBank}
            setSelectedBank={(bank) => {
              setSelectedBank(bank);
            }}
            isSelectable={!isDialog}
            banks={banks}
            lendMode={lendMode}
            connected={connected}
          />
        </div>
        <div className="flex-auto">
          <Input
            type="text"
            ref={amountInputRef}
            inputMode="decimal"
            value={amountRaw}
            disabled={isInputDisabled}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="0"
            className="h-[48px] min-w-[130px] border-none bg-neutral-800 text-right text-base font-medium outline-none focus-visible:outline-none focus-visible:ring-0 dark:bg-neutral-800"
          />
        </div>
      </div>
      <LendingAction
        walletAmount={walletAmount}
        maxAmount={maxAmount}
        onSetAmountRaw={(amount) => handleInputChange(amount)}
        selectedBank={selectedBank}
        lendMode={lendMode}
      />
    </div>
  );
};
