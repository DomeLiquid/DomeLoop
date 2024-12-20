import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ExtendedBankInfo } from '@/lib/mrgnlend';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React from 'react';

type TokenListCommandProps = {
  selectedBank: ExtendedBankInfo | null;
  onSetSearchQuery: (search: string) => void;
  onClose: () => void;
  children: React.ReactNode;
};

export const TokenListCommand = ({
  selectedBank,
  onSetSearchQuery,
  onClose,
  children,
}: TokenListCommandProps) => {
  const isMobile = useIsMobile();
  return (
    <>
      <Command
        className="relative bg-background"
        shouldFilter={false}
        value={selectedBank?.bankId ?? ''}
      >
        <CommandInput
          placeholder="Search token..."
          wrapperClassName="fixed mx-2 lg:mx-0 bg-background w-[calc(100%-30px)] px-4 lg:pl-3 border rounded-lg z-40 flex justify-between"
          className="h-12"
          autoFocus={false}
          onValueChange={(value) => onSetSearchQuery(value)}
        />
        <button
          onClick={() => onClose()}
          className={cn(
            'fixed z-50',
            isMobile ? 'right-4 top-9' : 'right-6 top-8',
          )}
        >
          <X size={18} className="text-muted-foreground" />
        </button>
        <CommandList className="mt-[60px] overflow-auto">
          {children}
        </CommandList>
      </Command>
    </>
  );
};
