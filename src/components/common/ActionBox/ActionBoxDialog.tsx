import React from 'react';

import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { GroupData } from '@/app/stores/tradeStore';
import { Account } from '@/types/account';
import { useIsMobile } from '@/hooks';
import { useActionBoxStore } from '@/hooks/useActionBoxStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import { ActionBox } from './ActionBox';
import { ArrowLeft } from 'lucide-react';

type ActionBoxDialogProps = {
  requestedAction?: ActionType;
  requestedBank: ExtendedBankInfo | null;
  activeGroupArg?: GroupData | null;
  requestedCollateralBank?: ExtendedBankInfo;
  requestedAccount?: Account;
  children: React.ReactNode;
  isTokenSelectable?: boolean;
  isActionBoxTriggered?: boolean;
};

export const ActionBoxDialog = React.forwardRef<
  HTMLDivElement,
  ActionBoxDialogProps
>(
  (
    {
      requestedAction,
      requestedBank,
      activeGroupArg,
      requestedCollateralBank,
      requestedAccount,
      children,
      isTokenSelectable,
      isActionBoxTriggered = false,
    },
    ref,
  ) => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const [selectedBank, setAmountRaw] = useActionBoxStore(true)((state) => [
      state.selectedBank,
      state.setAmountRaw,
    ]);

    React.useEffect(() => {
      setIsDialogOpen(isActionBoxTriggered);
    }, [setIsDialogOpen, isActionBoxTriggered]);

    React.useEffect(() => {
      if (!isDialogOpen) {
        setAmountRaw('', 0);
      }
    }, [isDialogOpen, setAmountRaw]);

    const handleOpenChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        setAmountRaw('', 0);
      }
    };

    const titleText = React.useMemo(() => {
      const selected = selectedBank ?? requestedBank;

      return `${requestedAction} ${selected?.token.symbol}`;
    }, [requestedAction, requestedBank, selectedBank]);

    return (
      <Dialog
        open={isDialogOpen}
        modal={!isMobile}
        onOpenChange={handleOpenChange}
      >
        <Mobile>
          {isDialogOpen && (
            <div className="fixed inset-0 z-40 h-screen bg-background md:z-50 md:bg-background/80" />
          )}
          <DialogTrigger asChild>
            <div ref={ref}>{children}</div>
          </DialogTrigger>
          <DialogContent
            hideClose={true}
            className="z-40 mt-20 flex justify-start border-none bg-transparent p-0 sm:rounded-2xl md:z-50 md:max-w-[520px] md:px-5 md:py-3"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>{titleText}</DialogTitle>
              <DialogDescription>{titleText}</DialogDescription>
            </DialogHeader>
            <div>
              <div
                className="flex cursor-pointer items-center gap-2 pl-2 capitalize hover:underline"
                onClick={() => setIsDialogOpen(false)}
              >
                <ArrowLeft /> {`${titleText}`}
              </div>
              <div className="mb-8 h-screen p-4">
                <ActionBox
                  activeGroupArg={activeGroupArg}
                  isDialog={true}
                  handleCloseDialog={() => setIsDialogOpen(false)}
                  requestedAction={requestedAction}
                  requestedBank={requestedBank ?? undefined}
                  isTokenSelectable={isTokenSelectable}
                />
              </div>
            </div>
          </DialogContent>
        </Mobile>

        <Desktop>
          <DialogTrigger asChild>
            <div ref={ref}>{children}</div>
          </DialogTrigger>
          <DialogContent
            className="m-0 bg-background p-4"
            hideClose={true}
            hidePadding={true}
            size="sm"
            position="top"
          >
            <DialogHeader>
              <DialogTitle className="sr-only">
                {requestedAction === ActionType.Deposit
                  ? 'Supply'
                  : requestedAction === ActionType.Withdraw
                    ? 'Withdraw'
                    : requestedAction === ActionType.Borrow
                      ? 'Borrow'
                      : 'Repay'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {requestedAction} {selectedBank?.token.symbol}
              </DialogDescription>
            </DialogHeader>

            <ActionBox
              requestedAction={requestedAction}
              requestedBank={requestedBank ?? undefined}
              requestedCollateralBank={requestedCollateralBank}
              requestedAccount={requestedAccount}
              isDialog={true}
              isTokenSelectable={isTokenSelectable}
              activeGroupArg={activeGroupArg}
            />
          </DialogContent>
        </Desktop>
      </Dialog>
    );
  },
);

ActionBoxDialog.displayName = 'ActionBoxDialog';
