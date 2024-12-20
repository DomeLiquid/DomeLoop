/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import { v4 as uuidv4 } from 'uuid';

import {
  ActionMethod,
  ActionType,
  ExtendedBankInfo,
  RepayType,
} from '@/lib/mrgnlend';
import { GroupData } from '@/app/stores/tradeStore';
import { Account } from '@/types/account';
import { useTradeStore, useUiStore } from '@/app/stores';
import { useActionBoxStore } from '@/hooks/useActionBoxStore';
import { cn, showToast } from '@/lib/utils';
import { ActionBoxInput } from './ActionBoxInput';
import { ActionBoxPreview } from './ActionBoxPreview';
import { ActionBoxActions } from './ActionBoxActions';
import { createPayment } from '@/lib/actions';
import { useRouter } from '@/navigation';

type ActionBoxProps = {
  requestedAction?: ActionType;
  requestedBank?: ExtendedBankInfo;
  requestedCollateralBank?: ExtendedBankInfo;
  requestedAccount?: Account;
  isDialog?: boolean;
  activeGroupArg?: GroupData | null;
  isTokenSelectable?: boolean;
  handleCloseDialog?: () => void;
};

type BlackListRoutesMap = {
  [tokenIdentifier: string]: {
    blacklistRoutes: string[];
  };
};

export const ActionBox = ({
  requestedAction,
  requestedBank,
  requestedAccount,
  requestedCollateralBank,
  isDialog,
  isTokenSelectable,
  handleCloseDialog,
}: ActionBoxProps) => {
  const [
    connected,
    isInitialized,
    assetAmountMap,
    setIsRefreshingStore,
    groupMap,
    refreshGroup,
  ] = useTradeStore((state) => [
    state.connected,
    state.initialized,
    state.assetAmountMap,
    state.setIsRefreshingStore,
    state.groupMap,
    state.refreshGroup,
  ]);

  const [
    amountRaw,
    repayAmountRaw,
    maxAmountCollat,
    actionMode,
    repayMode,
    selectedBank,
    selectedRepayBank,
    isLoading,

    refreshState,
    fetchActionBoxState,
    setActionMode,
    setIsLoading,
    setAmountRaw,
    refreshSelectedBanks,
  ] = useActionBoxStore(isDialog)((state) => [
    state.amountRaw,
    state.repayAmountRaw,
    state.maxAmountCollat,
    state.actionMode,
    state.repayMode,
    state.selectedBank,
    state.selectedRepayBank,
    state.isLoading,

    state.refreshState,
    state.fetchActionBoxState,
    state.setActionMode,
    state.setIsLoading,
    state.setAmountRaw,
    state.refreshSelectedBanks,
  ]);

  const [setIsActionComplete] = useUiStore((state) => [
    state.setIsActionComplete,
  ]);

  const [isSettingsMode, setIsSettingsMode] = React.useState<boolean>(false);
  const [additionalActionMethods, setAdditionalActionMethods] = React.useState<
    ActionMethod[]
  >([]);

  const activeGroup = React.useMemo(() => {
    if (!selectedBank && !requestedBank) return null;
    const bank = selectedBank ?? requestedBank;
    const group = groupMap.get(bank?.info.groupId ?? '');
    return group ?? null;
  }, [selectedBank, requestedBank, groupMap]);

  const selectedAccount = React.useMemo(() => {
    if (requestedAccount) {
      return requestedAccount;
    } else if (activeGroup?.selectedAccount) {
      return activeGroup.selectedAccount;
    } else {
      return null;
    }
  }, [requestedAccount, activeGroup?.selectedAccount]);

  const extendedBankInfos = React.useMemo(() => {
    return activeGroup
      ? [activeGroup.pool.token, ...activeGroup.pool.quoteTokens]
      : [];
  }, [activeGroup]);

  // Amount related useMemo's
  const amount = React.useMemo(() => {
    const strippedAmount = amountRaw.replace(/,/g, '');
    return isNaN(Number.parseFloat(strippedAmount))
      ? 0
      : Number.parseFloat(strippedAmount);
  }, [amountRaw]);

  const repayAmount = React.useMemo(() => {
    const strippedAmount = repayAmountRaw.replace(/,/g, '');
    return isNaN(Number.parseFloat(strippedAmount))
      ? 0
      : Number.parseFloat(strippedAmount);
  }, [repayAmountRaw]);

  const walletAmount = React.useMemo(() => {
    return assetAmountMap.get(selectedBank?.token.assetId ?? '') ?? 0;
  }, [assetAmountMap, selectedBank]);

  const maxAmount = React.useMemo(() => {
    if (!selectedBank || !isInitialized) {
      return 0;
    }

    let newMaxAmount = 0;
    switch (actionMode) {
      case ActionType.Deposit:
        newMaxAmount = selectedBank?.userInfo.maxDeposit ?? 0;
        break;
      case ActionType.Withdraw:
        newMaxAmount = selectedBank?.userInfo.maxWithdraw ?? 0;
        break;
      case ActionType.Borrow:
        newMaxAmount = selectedBank?.userInfo.maxBorrow ?? 0;
        break;
      case ActionType.Repay:
        newMaxAmount = selectedBank?.userInfo.maxRepay ?? 0;
        break;
      default:
        newMaxAmount = 0;
    }

    return newMaxAmount;
  }, [
    selectedBank,
    actionMode,
    isInitialized,
    walletAmount,
    maxAmountCollat,
    repayMode,
  ]);
  const isDust = false;
  const showCloseBalance = React.useMemo(
    () => actionMode === ActionType.Withdraw && isDust,
    [actionMode, isDust],
  );

  // const actionMethods = React.useMemo(
  //   () =>
  //     checkActionAvailable({
  //       amount,
  //       repayAmount,
  //       connected,
  //       showCloseBalance,
  //       selectedBank,
  //       selectedRepayBank,
  //       extendedBankInfos,
  //       Account: selectedAccount,
  //       nativeSolBalance,
  //       actionMode,
  //       blacklistRoutes: null,
  //       repayMode,
  //       repayCollatQuote: repayCollatQuote ?? null,
  //     }),
  //   [
  //     amount,
  //     repayAmount,
  //     connected,
  //     showCloseBalance,
  //     selectedBank,
  //     selectedRepayBank,
  //     extendedBankInfos,
  //     selectedAccount,
  //     nativeSolBalance,
  //     actionMode,
  //     repayMode,
  //     repayCollatQuote,
  //   ],
  // );


  const router = useRouter();
  React.useEffect(() => {
    if (!selectedBank) {
      fetchActionBoxState({ requestedAction, requestedBank });
    }
  }, [requestedAction, selectedBank, requestedBank, fetchActionBoxState]);

  React.useEffect(() => {
    refreshSelectedBanks(extendedBankInfos);
  }, [extendedBankInfos, refreshSelectedBanks]);

  // Cleanup the store when the component unmounts or wallet disconnects
  React.useEffect(() => {
    return () => refreshState();
  }, [refreshState, connected]);

  if (!isInitialized) {
    return null;
  }

  const handleAllAction = React.useCallback(async () => {
    if (!selectedBank) {
      console.error('selectedBank is null');
      showToast.error('Please select a bank');
      return;
    }

    if (!selectedAccount) {
      console.error('selectedAccount is null');
      showToast.error('Please connect your wallet');
      return;
    }

    let meta: Record<'withdraw_all' | 'repay_all', boolean> = {
      withdraw_all: false,
      repay_all: false,
    };

    // 检查是否是全部模式
    const isAllMode = amount === maxAmount;

    if (actionMode === ActionType.Withdraw && isAllMode) {
      meta.withdraw_all = true;
    } else if (actionMode === ActionType.Repay && isAllMode) {
      meta.repay_all = true;
    }

    const requestId = await createPayment({
      bankId: selectedBank.info.id,
      accountId: selectedAccount?.id ?? '',
      amount: amount.toString(),
      action: actionMode,
      meta,
    });

    if (!requestId || requestId === '') {
      showToast.error('Create payment failed');
      return;
    }

    router.push(`/payment/${requestId}`);
  }, [selectedBank, amount, maxAmount, actionMode, selectedAccount, router]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative w-full max-w-[520px] rounded-lg bg-background p-2 md:p-3',
            isDialog && 'py-2',
          )}
        >
          <>
            <ActionBoxInput
              walletAmount={walletAmount}
              amountRaw={amountRaw}
              maxAmount={maxAmount}
              showCloseBalance={showCloseBalance}
              selectedAccount={selectedAccount}
              isTokenSelectable={isTokenSelectable}
              isDialog={isDialog}
              tokensOverride={
                requestedCollateralBank && requestedBank
                  ? [requestedBank, requestedCollateralBank]
                  : undefined
              }
              activeGroup={activeGroup}
            />
            {/* 
            {additionalActionMethods.concat(actionMethods).map(
              (actionMethod, idx) =>
                actionMethod.description && (
                  <div className="pb-6" key={idx}>
                    <div
                      className={cn(
                        'flex gap-1 space-x-2 rounded-lg px-3.5 py-2.5 text-sm',
                        actionMethod.actionMethod === 'INFO' &&
                          'text-info-foreground bg-accent',
                        (!actionMethod.actionMethod ||
                          actionMethod.actionMethod === 'WARNING') &&
                          'text-alert-foreground bg-accent',
                        actionMethod.actionMethod === 'ERROR' &&
                          'bg-[#990000] text-primary',
                      )}
                    >
                      <IconAlertTriangle
                        className="shrink-0 translate-y-0.5"
                        size={16}
                      />
                      <div className="space-y-1">
                        <p>{actionMethod.description}</p>
                        {actionMethod.link && (
                          <p>
                            <Link
                              href={actionMethod.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                            >
                              <IconExternalLink
                                size={14}
                                className="inline -translate-y-[1px]"
                              />{' '}
                              {actionMethod.linkText || 'Read more'}
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ),
            )} */}
            <ActionBoxPreview
              selectedBank={selectedBank}
              activeGroup={activeGroup}
              actionMode={actionMode}
              amount={amount}
              // slippageBps={slippageBps}
              isEnabled={true}
              // repayWithCollatOptions={
              //   repayCollatQuote && repayAmount && selectedRepayBank
              //     ? {
              //         repayCollatQuote,
              //          repayCollatTxn: repayCollatTxns.repayCollatTxn,
              //         feedCrankTxs: repayCollatTxns.feedCrankTxs,
              //         withdrawAmount: repayAmount,
              //         depositBank: selectedRepayBank,
              //         connection,
              //       }
              //     : undefined
              // }
              // addAdditionalsPopup={(actions) =>
              //   setAdditionalActionMethods(actions)
              // }
            >
              <ActionBoxActions
                handleAction={() => {
                  // showCloseBalance
                  //   ? handleCloseBalance()
                  //   : handleLendingAction();
                  handleAllAction();
                }}
                isLoading={isLoading}
                showCloseBalance={showCloseBalance ?? false}
                isEnabled={true}
                actionMode={actionMode}
              />
            </ActionBoxPreview>
          </>
        </div>
      </div>
    </>
  );
};
