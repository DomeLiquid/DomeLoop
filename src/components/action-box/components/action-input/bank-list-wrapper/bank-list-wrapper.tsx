import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

type BankListWrapperProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  Trigger: React.JSX.Element;
  Content: React.JSX.Element;
  label?: string;
};

export const BankListWrapper = ({
  isOpen,
  setIsOpen,
  Trigger,
  Content,
  label = 'Select Token',
}: BankListWrapperProps) => {
  return (
    <>
      <Desktop>
        <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
          <DialogTrigger asChild>
            <div>{Trigger}</div>
          </DialogTrigger>
          <DialogContent
            className="m-0 bg-background p-4"
            hideClose={true}
            hidePadding={true}
            size="sm"
            position="top"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription>
                Select a token to add to your wallet
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-[500px] overflow-auto">{Content}</div>
          </DialogContent>
        </Dialog>
      </Desktop>
      <Mobile>
        <Drawer
          open={isOpen}
          onOpenChange={(open: boolean) => setIsOpen(open)}
          shouldScaleBackground={false}
        >
          <DrawerTrigger asChild>
            <div>{Trigger}</div>
          </DrawerTrigger>
          <DrawerContent className="z-[55] mt-0 h-full" hideTopTrigger={true}>
            <div className="h-full bg-background-gray px-2 pt-7">
              <h3 className="mb-4 pl-3 text-2xl font-semibold">{label}</h3>
              {Content}
            </div>
          </DrawerContent>
        </Drawer>
      </Mobile>
    </>
  );
};
