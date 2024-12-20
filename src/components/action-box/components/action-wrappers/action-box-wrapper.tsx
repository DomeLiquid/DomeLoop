import React from 'react';

import { useActionBoxStore } from '../../store';
import { ActionType } from '@/lib/mrgnlend';
import { cn } from '@/lib/utils';
import { Meteors } from '@/components/magicui/meteors';

interface ActionBoxWrapperProps {
  actionMode: ActionType;
  isDialog?: boolean;
  showSettings?: boolean;
  children: React.ReactNode;
}

export const ActionBoxWrapper = ({
  children,
  isDialog,
  actionMode,
  showSettings = false,
}: ActionBoxWrapperProps) => {
  // const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useActionBoxStore(
  //   (state) => [state.isSettingsDialogOpen, state.setIsSettingsDialogOpen],
  // );

  const isActionDisabled = false;

  if (isActionDisabled) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative w-full max-w-[480px] rounded-lg bg-background-gray p-4 text-white md:p-6',
            isDialog && 'border border-background-gray-light/50 py-5',
          )}
        >
          Action is temporary disabled. <br /> Visit our socials for more
          information.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative w-full max-w-[480px] rounded-lg border bg-background-gray p-2 text-white md:p-3',
            isDialog && 'border border-background-gray-light/50 py-5',
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
};
