import React from 'react';
import { ActionType } from '@/lib/mrgnlend';
import { Button } from '@/components/ui/button';
import { useTradeStore, useUiStore } from '@/app/stores';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

type ActionBoxActionsProps = {
  isLoading: boolean;
  isEnabled: boolean;
  actionMode: ActionType;
  showCloseBalance: boolean;
  handleAction: () => void;
};

export const ActionBoxActions = ({
  isLoading,
  isEnabled,
  showCloseBalance,
  actionMode,
  handleAction,
}: ActionBoxActionsProps) => {
  const connected = useTradeStore((state) => state.connected);

  const buttonLabel = React.useMemo(
    () => (showCloseBalance ? 'Close' : actionMode),
    [showCloseBalance, actionMode],
  );

  if (!connected) {
    return (
      <Button className="w-full py-5" onClick={() => signIn()}>
        Sign in
      </Button>
    );
  }

  return (
    <Button
      disabled={isLoading || !isEnabled}
      className="w-full py-5"
      onClick={handleAction}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : buttonLabel}
    </Button>
  );
};
