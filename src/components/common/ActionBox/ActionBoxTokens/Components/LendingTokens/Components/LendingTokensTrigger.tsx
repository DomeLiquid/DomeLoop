import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ExtendedBankInfo, RepayType } from '@/lib/mrgnlend';
import { LendingModes } from '@/types/type';
import React from 'react';
import { computeBankRate } from '@/components/action-box/actions/lend-box/utils/mrgnUtils';
import { SelectedBankItem } from '../../SharedComponents';
import { ChevronDown } from 'lucide-react';

type LendingTokensTriggerProps = {
  selectedBank: ExtendedBankInfo | null;
  selectedRepayBank: ExtendedBankInfo | null;
  lendingMode: LendingModes;
  isOpen?: boolean;
  repayType?: RepayType;
};

export const LendingTokensTrigger = React.forwardRef<
  HTMLButtonElement,
  LendingTokensTriggerProps
>(
  (
    { selectedBank, selectedRepayBank, lendingMode, isOpen, repayType },
    ref,
  ) => {
    const isRepayWithCollat = false;

    const calculateRate = React.useCallback(
      (bank: ExtendedBankInfo) => computeBankRate(bank, lendingMode),
      [lendingMode],
    );

    return (
      <Button
        ref={ref}
        className={cn(
          'w-full items-center gap-2.5 bg-background text-left text-sm font-normal text-foreground transition-colors hover:bg-background/90',
          'justify-start px-3 py-6 xs:justify-center xs:py-6 xs:pl-3.5 xs:pr-2.5',
          isOpen && 'bg-background',
        )}
      >
        {!isRepayWithCollat && selectedBank && (
          <SelectedBankItem
            bank={selectedBank}
            lendingMode={lendingMode}
            rate={calculateRate(selectedBank)}
          />
        )}
        {isRepayWithCollat && selectedRepayBank && (
          <SelectedBankItem
            bank={selectedRepayBank}
            lendingMode={lendingMode}
          />
        )}
        {((!isRepayWithCollat && !selectedBank) ||
          (isRepayWithCollat && !selectedRepayBank)) && <>Select token</>}
        <ChevronDown className="shrink-0" size={20} />
      </Button>
    );
  },
);

LendingTokensTrigger.displayName = 'LendingTokensTrigger';
