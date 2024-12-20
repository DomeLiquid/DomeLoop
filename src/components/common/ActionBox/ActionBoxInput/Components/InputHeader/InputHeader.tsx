import { useActionBoxStore } from '@/hooks/useActionBoxStore';
import { ActionType } from '@/lib/mrgnlend';
import { RepayType } from '@/lib/mrgnlend';
import React from 'react';
import { InputHeaderActionLeft } from './Components';

type props = {
  isDialog?: boolean;

  changeRepayType: (repayType: RepayType) => void;
  changeActionType: (actionType: ActionType) => void;
};

export const InputHeader = ({
  isDialog,
  changeRepayType,
  changeActionType,
}: props) => {
  const [actionMode, selectedBank, repayMode] = useActionBoxStore(isDialog)(
    (state) => [state.actionMode, state.selectedBank, state.repayMode],
  );

  // Section above the input
  return (
    <div className="mb-2 flex flex-row items-center justify-between">
      {/* Title text */}

      <div className="flex items-center text-lg font-normal">
        <InputHeaderActionLeft
          actionType={actionMode}
          bank={selectedBank}
          repayType={repayMode}
          isDialog={isDialog}
          changeRepayType={(value) => changeRepayType(value)}
          changeActionType={(value) => changeActionType(value)}
        />
      </div>
    </div>
  );
};
