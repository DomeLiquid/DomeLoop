import React from 'react';

import Image from 'next/image';
import { GroupData } from '@/app/stores/tradeStore';
import { useTradeStore } from '@/app/stores';
import { ActionType, ActiveBankInfo } from '@/lib/mrgnlend';
import { Button } from '../ui/button';
import { ActionBoxDialog } from '../common/ActionBox/ActionBoxDialog';
import { IconLoader2, IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import { cn, showToast } from '@/lib/utils';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { TokenSymbol } from '../token-item';
import { percentFormatter } from '@/lib/formatters';
import { closePositionPreview, createPayment } from '@/lib/actions';
import { useRouter } from '@/navigation';
import { ClosePositionPreviewResponse } from '@/types/account';

type PositionActionButtonsProps = {
  isBorrowing: boolean;
  rightAlignFinalButton?: boolean;
  activeGroup: GroupData;
};

export const PositionActionButtons = ({
  isBorrowing,
  rightAlignFinalButton = false,
  activeGroup,
}: PositionActionButtonsProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = React.useState(false);
  const [previewData, setPreviewData] =
    React.useState<ClosePositionPreviewResponse | null>(null);

  const [connected, refreshGroup, setIsRefreshingStore] = useTradeStore(
    (state) => [
      state.connected,
      state.refreshGroup,
      state.setIsRefreshingStore,
    ],
  );
  const router = useRouter();

  const depositBanks = React.useMemo(() => {
    const tokenBank = activeGroup.pool.token.isActive
      ? activeGroup.pool.token
      : null;
    const quoteBank =
      activeGroup.pool.quoteTokens.filter((bank) => bank.isActive)[0] ?? null;

    return [tokenBank, quoteBank].filter(
      (bank): bank is ActiveBankInfo =>
        bank !== null &&
        'balanceWithLendingPosition' in bank &&
        bank.balanceWithLendingPosition?.position?.isLending === true,
    );
  }, [activeGroup]);

  const borrowBank = React.useMemo(() => {
    const tokenBank = activeGroup.pool.token.isActive
      ? activeGroup.pool.token
      : null;
    const quoteBank =
      activeGroup.pool.quoteTokens.filter((bank) => bank.isActive)[0] ?? null;

    let borrowBank = null;
    if (
      tokenBank &&
      'balanceWithLendingPosition' in tokenBank &&
      !tokenBank.balanceWithLendingPosition?.position?.isLending
    ) {
      borrowBank = tokenBank;
    } else if (
      quoteBank &&
      'balanceWithLendingPosition' in quoteBank &&
      !quoteBank.balanceWithLendingPosition?.position?.isLending
    ) {
      borrowBank = quoteBank;
    }

    return borrowBank;
  }, [activeGroup]);

  const handlePreviewClose = React.useCallback(async () => {
    if (!activeGroup.selectedAccount) {
      showToast.error('Please connect your wallet');
      return;
    }

    setIsClosing(true);
    try {
      const preview = await closePositionPreview({
        accountId: activeGroup.selectedAccount.id,
        groupId: activeGroup.groupId,
      });

      if (preview) {
        setPreviewData(preview);
        setShowPreviewDialog(true);
      }
    } catch (error) {
      console.error('Failed to get position preview:', error);
      showToast.error('Failed to get position preview');
    } finally {
      setIsClosing(false);
    }
  }, [activeGroup]);

  const closePosition = React.useCallback(async () => {
    if (!activeGroup.selectedAccount || (!borrowBank && !depositBanks[0]))
      return;

    if (!activeGroup.selectedAccount) {
      console.error('selectedAccount is null');
      showToast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const requestId = await createPayment({
        accountId: activeGroup.selectedAccount?.id ?? '',
        bankId: depositBanks[0].bankId,
        amount: '0.00000001',
        action: 'Dome Loop Close Position',
        closePosition: {
          groupId: activeGroup.groupId,
        },
      });
      if (requestId) {
        router.push(`/payment/${requestId}`);
      }
    } finally {
      setIsLoading(false);
      setShowPreviewDialog(false);
    }
  }, [
    activeGroup,
    connected,
    setIsRefreshingStore,
    refreshGroup,
    borrowBank,
    depositBanks,
  ]);

  return (
    <div className="flex w-full gap-3">
      <ActionBoxDialog
        requestedBank={depositBanks[0]}
        requestedAction={ActionType.Deposit}
        requestedAccount={activeGroup.selectedAccount ?? undefined}
        activeGroupArg={activeGroup}
      >
        <Button
          variant="outline"
          size="sm"
          className="min-w-16 gap-1"
          onClick={() => {
            // capture('position_add_btn_click', {
            //   group: activeGroup?.groupPk?.toBase58(),
            //   token: activeGroup.pool.token.meta.tokenSymbol,
            // });
          }}
        >
          <IconPlus size={14} />
          Add
        </Button>
      </ActionBoxDialog>
      {borrowBank && isBorrowing && (
        <ActionBoxDialog
          requestedBank={borrowBank}
          requestedAction={ActionType.Repay}
          requestedAccount={activeGroup.selectedAccount ?? undefined}
          activeGroupArg={activeGroup}
        >
          <Button
            variant="outline"
            size="sm"
            className="min-w-16 gap-1"
            onClick={() => {
              // capture('position_reduce_btn_click', {
              //   group: activeGroup?.groupPk?.toBase58(),
              //   token: activeGroup.pool.token.meta.tokenSymbol,
              // });
            }}
          >
            <IconMinus size={14} />
            Reduce
          </Button>
        </ActionBoxDialog>
      )}
      {!isBorrowing && (
        <ActionBoxDialog
          activeGroupArg={activeGroup}
          requestedBank={depositBanks[0]}
          requestedAction={ActionType.Withdraw}
          requestedAccount={activeGroup.selectedAccount ?? undefined}
          requestedCollateralBank={
            depositBanks.length > 1 ? depositBanks[1] : undefined
          }
        >
          <Button
            variant="outline"
            size="sm"
            className="min-w-16 gap-1"
            onClick={() => {
              // capture('position_withdraw_btn_click', {
              //   group: activeGroup?.groupPk?.toBase58(),
              //   token: activeGroup.pool.token.meta.tokenSymbol,
              // });
            }}
          >
            <IconMinus size={14} />
            Withdraw
          </Button>
        </ActionBoxDialog>
      )}
      <Button
        onClick={handlePreviewClose}
        disabled={isClosing}
        variant="destructive"
        size="sm"
        className={cn('min-w-16 gap-1', rightAlignFinalButton && 'ml-auto')}
      >
        {isClosing ? (
          <IconLoader2 className="animate-spin" />
        ) : (
          <>
            <IconX size={14} />
            Close
          </>
        )}
      </Button>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="w-full space-y-12">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 border-b border-border pb-10">
              <span className="flex items-center justify-center gap-2">
                {activeGroup.pool.token && (
                  <TokenSymbol asset={activeGroup.pool.token.token} />
                )}
                <span className="text-4xl font-medium">
                  {`${activeGroup.pool.token.token.symbol}/${activeGroup.pool.quoteTokens[0].token.symbol}`}
                </span>
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Close Position Preview
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-6">
              {previewData.increaseAssetInfo.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">You will receive</h3>
                  {previewData.increaseAssetInfo.map((asset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <TokenSymbol asset={asset.tokenDataWithPriceInfo} />
                        <span>{asset.tokenDataWithPriceInfo.symbol}</span>
                      </div>
                      <span>{asset.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {previewData.decreaseAssetInfo.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">You will pay</h3>
                  {previewData.decreaseAssetInfo.map((asset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <TokenSymbol asset={asset.tokenDataWithPriceInfo} />
                        <span>{asset.tokenDataWithPriceInfo.symbol}</span>
                      </div>
                      <span>{asset.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isLoading}
              className="mx-auto w-full"
              onClick={closePosition}
            >
              {isLoading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                'Confirm close position'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
