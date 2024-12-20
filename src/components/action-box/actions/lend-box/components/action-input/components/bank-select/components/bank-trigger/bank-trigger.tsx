import { computeBankRate } from '@/components/action-box/actions/lend-box/utils/mrgnUtils';
import { SelectedBankItem } from '@/components/action-box/components/action-input';
import { TokenSymbol } from '@/components/token-item';
import { Button } from '@/components/ui/button';
import { ExtendedBankInfo } from '@/lib/mrgnlend';
import { cn } from '@/lib/utils';
import { LendingModes } from '@/types/type';
import { ChevronDown } from 'lucide-react';
import React from 'react';

type BankTriggerProps = {
  selectedBank: ExtendedBankInfo | null;
  lendingMode: LendingModes;
  isOpen?: boolean;
};

export const BankTrigger = React.forwardRef<
  HTMLButtonElement,
  BankTriggerProps
>(({ selectedBank, lendingMode, isOpen }, ref) => {
  const calculateRate = React.useCallback(
    (bank: ExtendedBankInfo) => computeBankRate(bank, lendingMode),
    [lendingMode],
  );

  return (
    <Button
      ref={ref}
      className={cn(
        'w-full items-center gap-2.5 bg-gray-800 text-left text-base font-normal text-white transition-colors hover:bg-gray-900 dark:bg-neutral-800 dark:hover:bg-neutral-700/25',
        'justify-start px-3 py-6 xs:justify-center xs:py-6 xs:pl-3.5 xs:pr-2.5',
        isOpen && 'bg-background-gray',
      )}
    >
      {selectedBank && (
        <SelectedBankItem
          bank={selectedBank}
          lendingMode={lendingMode}
          rate={calculateRate(selectedBank)}
        />
      )}
      {!selectedBank && <>Select token</>}
      <ChevronDown className="shrink-0" size={20} />
    </Button>
  );
});

BankTrigger.displayName = 'BankTrigger';
