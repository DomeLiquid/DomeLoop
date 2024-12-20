/* eslint-disable react-hooks/exhaustive-deps */
import { GroupData } from '@/app/stores/tradeStore';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/navigation';
import { useTradeStore, useUiStore } from '@/app/stores';
import React from 'react';
import {
  calculateLoopingParams,
  checkLoopingActionAvailable,
  generateStats,
  TradeSide,
} from './tradingBox.utils';
import { useDebounce } from '@uidotdev/usehooks';
import { computeMaxLeverage } from '@/lib/tradeUtils';
import { numeralFormatter } from '@/lib/formatters';
import { IconWallet } from '@tabler/icons-react';
import { formatAmount } from '../action-box/actions/lend-box/utils/mrgnUtils';
import { TokenCombobox } from '../TokenCombobox';
import { LoopingObject } from '@/types/type';
import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { WalletState } from '@/app/stores/uiStore';
import { cn, showToast } from '@/lib/utils';
import { ActionBoxDialog } from '../common/ActionBox/ActionBoxDialog';
import { ActionMethod, ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { capitalize } from 'lodash';
import { CreatePaymentRequest, Account } from '@/types/account';
import { createLoopingPayment } from '@/lib/actions';

type TradingBoxProps = {
  activeGroup: GroupData;
  side: 'long' | 'short';
};

export const TradingBox = ({ activeGroup, side = 'long' }: TradingBoxProps) => {
  const router = useRouter();

  const [tradeState, setTradeState] = React.useState<TradeSide>(
    side || 'long', // 添加 fallback
  );
  const [amount, setAmount] = React.useState<string>('');
  const [loopingObject, setLoopingObject] =
    React.useState<LoopingObject | null>(null);
  const [leverage, setLeverage] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [Stats, setStats] = React.useState<React.JSX.Element>(<></>);
  const [additionalChecks, setAdditionalChecks] =
    React.useState<ActionMethod[]>();

  const debouncedLeverage = useDebounce(leverage, 1000);
  const debouncedAmount = useDebounce(amount, 1000);

  const leveragedAmount = React.useMemo(() => {
    if (tradeState === 'long') {
      return loopingObject?.actualDepositAmount;
    } else {
      return loopingObject?.borrowAmount;
    }
  }, [tradeState, loopingObject]);

  const [connected, setIsRefreshingStore, refreshGroup] = useTradeStore(
    (state) => [
      state.connected,
      state.setIsRefreshingStore,
      state.refreshGroup,
    ],
  );

  const clearStates = () => {
    setAmount('');
    setLoopingObject(null);
    setLeverage(1);
    setAdditionalChecks(undefined);
  };

  const [setWalletState, setIsActionComplete] = useUiStore((state) => [
    state.setWalletState,
    state.setIsActionComplete,
  ]);

  // React.useEffect(() => {
  //   if (tradeState !== prevTradeState) {
  //     clearStates();
  //   }
  // }, [tradeState, prevTradeState]);

  const numberFormater = React.useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }),
    [],
  );
  const isActiveWithCollat = true;

  const maxLeverage = React.useMemo(() => {
    if (activeGroup) {
      const deposit =
        tradeState === 'long'
          ? activeGroup.pool.token
          : activeGroup.pool.quoteTokens[0];
      const borrow =
        tradeState === 'long'
          ? activeGroup.pool.quoteTokens[0]
          : activeGroup.pool.token;

      const { maxLeverage } = computeMaxLeverage(deposit, borrow);
      return maxLeverage;
    }
    return 0;
  }, [activeGroup, tradeState]);

  const collateralBank = React.useMemo(() => {
    if (activeGroup) {
      if (tradeState === 'short') {
        return activeGroup.pool.quoteTokens[0];
      } else {
        return activeGroup.pool.token;
      }
    }
  }, [activeGroup, tradeState]);

  const maxAmount = React.useMemo(() => {
    if (collateralBank) {
      return collateralBank.userInfo.maxDeposit;
    }
    return 0;
  }, [collateralBank]);

  const actionMethods = React.useMemo(
    () =>
      checkLoopingActionAvailable({
        amount,
        connected,
        activeGroup,
        loopingObject,
        tradeSide: tradeState,
      }),
    [amount, connected, activeGroup, loopingObject, tradeState],
  );

  const walletAmount = React.useMemo(() => {
    if (!activeGroup) return 0;
    const bank =
      tradeState === 'long'
        ? activeGroup.pool.token
        : activeGroup.pool.quoteTokens[0];
    return bank?.userInfo.userAssetAmount?.amount ?? 0;
  }, [tradeState, activeGroup]);

  const loadStats = React.useCallback(
    async (looping: LoopingObject, isAccountInitialized: boolean) => {
      if (!activeGroup) {
        return;
      }
      setStats(
        generateStats(
          activeGroup.accountSummary,
          activeGroup.pool.token,
          activeGroup.pool.quoteTokens[0],
          looping,
          isAccountInitialized,
        ),
      );
    },
    [activeGroup],
  );

  const handleLeverageAction = React.useCallback(async () => {
    if (loopingObject && activeGroup && collateralBank) {
      try {
        setIsLoading(true);
        let depositBank: ExtendedBankInfo, borrowBank: ExtendedBankInfo;
        let sig: undefined | string[];

        if (activeGroup) {
          if (tradeState === 'short') {
            depositBank = activeGroup.pool.quoteTokens[0];
            borrowBank = activeGroup.pool.token;
          } else {
            depositBank = activeGroup.pool.token;
            borrowBank = activeGroup.pool.quoteTokens[0];
          }
          const request: CreatePaymentRequest = {
            bankId: depositBank.bankId,
            accountId: activeGroup.selectedAccount?.id ?? '',
            amount: amount,
            action: ActionType.Loop,
            loopOptions: {
              targetLeverage: leverage.toString(),
              borrowBankId: borrowBank.bankId,
            },
          };

          const requestId = await createLoopingPayment(request);
          if (requestId) {
            router.push(`/payment/${requestId}`);
          } else {
            console.log('Error while creating looping payment');
            setIsActionComplete(false);
            showToast.error('Error while creating looping payment');
          }
        }
        // -------- Refresh state
        try {
          setLoopingObject(null);
          setIsRefreshingStore(true);
          await refreshGroup({
            groupId: activeGroup.groupId,
          });
        } catch (error: any) {
          console.log(error);
        }

        return sig;
      } catch (error: any) {
        // const msg = extractErrorString(error);
        //Sentry.captureException({ message: error });
        // multiStepToast.setFailed(msg);
        const msg = 'try leverage action error';
        console.log(error);
        return;
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    activeGroup,
    amount,
    collateralBank,
    connected,
    leverage,
    loopingObject,
    setIsActionComplete,
    setIsRefreshingStore,
    tradeState,
  ]);

  const handleAmountChange = React.useCallback(
    (amountRaw: string) => {
      const amount = formatAmount(
        amountRaw,
        maxAmount,
        collateralBank ?? null,
        numberFormater,
      );
      setAmount(amount);
    },
    [maxAmount, collateralBank, numberFormater],
  );

  const handleSimulation = React.useCallback(
    async (
      looping: LoopingObject,
      bank: ExtendedBankInfo,
      selectedAccount: Account | null,
    ) => {
      if (!activeGroup) {
        return;
      }

      loadStats(looping, !!selectedAccount);
    },
    [loadStats],
  );

  const loadLoopingVariables = React.useCallback(async () => {
    if (activeGroup) {
      try {
        if (Number(amount) === 0 || leverage <= 1) {
          throw new Error('Amount is 0');
        }
        setIsLoading(true);

        let borrowBank, depositBank;

        if (tradeState === 'long') {
          depositBank = activeGroup.pool.token;
          borrowBank = activeGroup.pool.quoteTokens[0];
        } else {
          depositBank = activeGroup.pool.quoteTokens[0];
          borrowBank = activeGroup.pool.token;
        }
        setAdditionalChecks(undefined);

        const strippedAmount = amount.replace(/,/g, '');
        const amountParsed = isNaN(Number.parseFloat(strippedAmount))
          ? 0
          : Number.parseFloat(strippedAmount);

        const result = await calculateLoopingParams({
          depositBank,
          borrowBank,
          targetLeverage: leverage,
          amount: amountParsed,
        });

        setLoopingObject(result);
        if (loopingObject) {
          await handleSimulation(
            loopingObject,
            depositBank,
            activeGroup.selectedAccount,
          );
        }
      } catch (error) {
        setLoopingObject(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeGroup, amount, leverage, tradeState, handleSimulation]);

  React.useEffect(() => {
    if (activeGroup) {
      setStats(
        generateStats(
          activeGroup.accountSummary,
          activeGroup.pool.token,
          activeGroup.pool.quoteTokens[0],
          null,
          false,
        ),
      );
    }
  }, [activeGroup]);
  const handleMaxAmount = React.useCallback(() => {
    if (activeGroup) {
      handleAmountChange(maxAmount.toString());
    }
  }, [activeGroup, maxAmount, handleAmountChange]);

  React.useEffect(() => {
    if (debouncedAmount && debouncedLeverage) {
      loadLoopingVariables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLeverage, debouncedAmount]);

  if (!activeGroup) return null;

  return (
    <>
      <Card className="w-full border-border shadow-none">
        <CardContent className="pt-6">
          {isActiveWithCollat ? (
            <div className="space-y-4">
              <ToggleGroup
                type="single"
                className="w-full gap-4"
                value={tradeState}
                onValueChange={(value) =>
                  value && setTradeState(value as TradeSide)
                }
              >
                <ToggleGroupItem
                  className="w-full border"
                  value="long"
                  aria-label="Toggle long"
                >
                  Long
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="w-full border"
                  value="short"
                  aria-label="Toggle short"
                >
                  Short
                </ToggleGroupItem>
              </ToggleGroup>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Amount</Label>
                  {walletAmount > 0 && (
                    <Button
                      size="sm"
                      variant="link"
                      className="ml-auto flex items-center gap-1 text-xs no-underline hover:underline"
                      onClick={() => handleMaxAmount()}
                    >
                      <IconWallet size={14} /> {numeralFormatter(walletAmount)}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => handleMaxAmount()}
                    className="no-underline hover:underline"
                  >
                    Max
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    {collateralBank?.token.symbol}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Size of {tradeState}</Label>
                <div className="relative flex items-center gap-2 rounded-lg border border-accent p-2">
                  <TokenCombobox
                    selected={activeGroup}
                    setSelected={(group) => {
                      router.push(`/trade/${group.groupId}`);
                      clearStates();
                    }}
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={leveragedAmount ? leveragedAmount.toFixed(8) : 0}
                    disabled
                    className="appearance-none border-none border-accent bg-background text-right shadow-none focus-visible:outline-none focus-visible:ring-0 disabled:opacity-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Leverage</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {leverage.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  className="w-full"
                  defaultValue={[1]}
                  min={1}
                  step={0.01}
                  max={maxLeverage === 0 ? 1 : maxLeverage}
                  value={[leverage]}
                  onValueChange={(value) => {
                    if (value[0] > maxLeverage) return;
                    setLeverage(value[0]);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-center">
              <p className="text-muted-foreground">
                You need to deposit collateral (USDC) in this pool before you
                can trade.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-5 md:pt-0">
          {tradeState === 'long' &&
            activeGroup?.pool.token.userInfo.userAssetAmount?.amount === 0 && (
              <div className="flex w-full gap-1 space-x-2 rounded-lg bg-accent px-3.5 py-2.5 text-sm text-alert-foreground">
                <AlertTriangle className="shrink-0 translate-y-0.5" size={16} />
                <div className="space-y-1">
                  <p>
                    You need to hold {activeGroup?.pool.token.token.symbol} to
                    open a long position.{' '}
                    <button
                      className="border-b border-alert-foreground hover:border-transparent"
                      onClick={() => {
                        setWalletState(WalletState.SWAP);
                      }}
                    >
                      Swap tokens.
                    </button>
                  </p>
                </div>
              </div>
            )}

          {tradeState === 'short' &&
            activeGroup?.pool.quoteTokens[0].userInfo.userAssetAmount
              ?.amount === 0 && (
              <div className="flex w-full gap-1 space-x-2 rounded-lg bg-accent px-3.5 py-2.5 text-sm text-alert-foreground">
                <AlertTriangle className="shrink-0 translate-y-0.5" size={16} />
                <div className="space-y-1">
                  <p>
                    You need to hold{' '}
                    {activeGroup?.pool.quoteTokens[0].token.symbol} to open a
                    short position.{' '}
                    <button
                      className="border-b border-alert-foreground hover:border-transparent"
                      onClick={() => {
                        setWalletState(WalletState.SWAP);
                      }}
                    >
                      Swap tokens.
                    </button>
                  </p>
                </div>
              </div>
            )}

          {isActiveWithCollat ? (
            <>
              <div className="flex w-full flex-col items-center gap-1">
                {actionMethods.concat(additionalChecks ?? []).map(
                  (actionMethod, idx) =>
                    actionMethod.description && (
                      <div className="w-full pb-6" key={idx}>
                        <div
                          className={cn(
                            'flex gap-1 space-x-2 rounded-lg px-3.5 py-2.5 text-sm',
                            actionMethod.actionMethod === 'INFO' &&
                              'bg-accent text-info-foreground',
                            (!actionMethod.actionMethod ||
                              actionMethod.actionMethod === 'WARNING') &&
                              'bg-accent text-alert-foreground',
                            actionMethod.actionMethod === 'ERROR' &&
                              'bg-[#990000] text-white',
                          )}
                        >
                          <AlertTriangle
                            className="shrink-0 translate-y-0.5"
                            size={16}
                          />
                          <div className="space-y-1">
                            <p>{actionMethod.description}</p>
                            {actionMethod.action && (
                              <ActionBoxDialog
                                activeGroupArg={activeGroup}
                                requestedAction={actionMethod.action.type}
                                requestedBank={actionMethod.action.bank}
                              >
                                <p className="cursor-pointer underline hover:no-underline">
                                  {actionMethod.action.type}{' '}
                                  {actionMethod.action.bank.token.symbol}
                                </p>
                              </ActionBoxDialog>
                            )}
                            {actionMethod.link && (
                              <p>
                                <Link
                                  href={actionMethod.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:no-underline"
                                >
                                  <ExternalLink
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
                )}
                <Button
                  onClick={() => {
                    handleLeverageAction();
                  }}
                  disabled={
                    !!actionMethods
                      .concat(additionalChecks ?? [])
                      .filter((value) => value.isEnabled === false).length ||
                    isLoading
                  }
                  className={cn(
                    'w-full',
                    tradeState === 'long' && 'bg-success',
                    tradeState === 'short' && 'bg-error',
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      {capitalize(tradeState)}{' '}
                      {activeGroup.pool.token.token.symbol}
                    </>
                  )}
                </Button>
                {/* <TradingBoxSettingsDialog
                  setSlippageBps={(value) => setSlippageBps(value * 100)}
                  slippageBps={slippageBps / 100}
                >
                  <div className="ml-auto mt-2 flex justify-end gap-2">
                    <button className="flex h-6 items-center gap-1 rounded-full border bg-transparent px-2 text-xs text-muted-foreground hover:bg-accent">
                      Settings <IconSettings size={16} />
                    </button>
                  </div>
                </TradingBoxSettingsDialog> */}
              </div>
              {Stats}
            </>
          ) : (
            <ActionBoxDialog
              activeGroupArg={activeGroup}
              requestedAction={ActionType.Deposit}
              requestedBank={activeGroup.pool.quoteTokens[0]}
            >
              <Button className="w-full">Deposit Collateral</Button>
            </ActionBoxDialog>
          )}
        </CardFooter>
      </Card>
    </>
  );
};
