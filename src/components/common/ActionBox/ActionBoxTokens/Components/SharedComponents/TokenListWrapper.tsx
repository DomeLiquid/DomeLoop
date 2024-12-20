import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Desktop, Mobile } from '@/lib/mediaQueryUtils';
import React from 'react';

type TokenListWrapperProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  Trigger: React.JSX.Element;
  Content: React.JSX.Element;
  label?: string;
};

export const TokenListWrapper = ({
  isOpen,
  setIsOpen,
  Trigger,
  Content,
  label = 'Select Token',
}: TokenListWrapperProps) => {
  return (
    <>
      <Desktop>
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
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
              <DialogDescription>{label}</DialogDescription>
            </DialogHeader>
            <div className="relative h-[500px] overflow-auto">{Content}</div>
          </DialogContent>
        </Dialog>
      </Desktop>
      <Mobile>
        <Drawer open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
          <DrawerTrigger asChild>
            <div>{Trigger}</div>
          </DrawerTrigger>
          <DrawerContent className="z-[55] mt-0 h-full" hideTopTrigger={true}>
            <DialogHeader className="sr-only">
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription>{label}</DialogDescription>
            </DialogHeader>
            <div className="h-full bg-background px-2 pt-7">
              <h3 className="mb-4 pl-3 text-2xl font-semibold">{label}</h3>
              {Content}
            </div>
          </DrawerContent>
        </Drawer>
      </Mobile>
    </>
  );
};
