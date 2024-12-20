'use client';

import { useIsMobile } from '@/hooks';
import { IconDomeLoop, IconMixin } from '@/lib';
import { cn } from '@/lib/utils';
import { Link, usePathname, useRouter } from '@/navigation';
import { Button } from '../ui/button';
import { motion, useAnimate } from 'framer-motion';
import { useTradeStore } from '@/app/stores';
import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '../ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CircleUser, CircleX, LogOut } from 'lucide-react';
import { siteConfig } from '@/config/site';
// import { DesktopNav } from './desktop-nav';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import TabbedInterface from './tabs';
import { RainbowButton } from '../magicui/rainbow-button';
import { navItems } from '@/config/config';

const Header = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

  const [
    connected,
    initialized,
    groupMap,
    fetchTradeState,
    referralCode,
    setConnected,
  ] = useTradeStore((state) => [
    state.connected,
    state.initialized,
    state.groupMap,
    state.fetchTradeState,
    state.referralCode,
    state.setConnected,
  ]);

  const [scope, animate] = useAnimate();
  const isMobile = useIsMobile();
  const asPath = usePathname();

  React.useEffect(() => {
    if (!initialized) return;
    animate('[data-header]', { opacity: 1, y: 0 }, { duration: 0.3, delay: 0 });
  }, [initialized, animate]);

  React.useEffect(() => {
    if (session?.user) {
      setConnected(true);
    }
  }, [session?.user]);

  return (
    <div ref={scope} className="relative h-[64px]">
      <motion.header
        data-header
        className="fixed z-50 flex w-full items-center justify-between gap-8 bg-background px-4 py-3.5"
        initial={{ opacity: 0, y: -64 }}
      >
        {isMobile ? (
          <AccountInfo />
        ) : (
          <>
            <Link href="/">
              <IconDomeLoop size={isMobile ? 40 : 40} className="opacity-90" />
            </Link>
          </>
        )}
        <nav className="mr-auto hidden w-full items-center justify-between lg:flex">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => {
              let hrefSegment = `/${item.href.split('/')[1]}`;
              let asPathSegment = `/${asPath.split('/')[1]}`;

              if (asPathSegment === '/pools') {
                asPathSegment = '/';
              }
              return (
                <li key={item.label}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        asPathSegment === hrefSegment &&
                          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      )}
                    >
                      {item.label}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>

          <AccountInfo />
        </nav>
      </motion.header>
    </div>
  );
};

export default Header;

export const AccountInfo = () => {
  const { data: session } = useSession();
  const [initialized, connected, setConnected] = useTradeStore((state) => [
    state.initialized,
    state.connected,
    state.setConnected,
  ]);
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (session?.user) {
      setConnected(true);
    }
  }, [session?.user]);

  React.useEffect(() => {
    if (session?.user) {
      setConnected(true);
    }
  }, [session?.user]);

  return (
    <>
      <div className="flex items-center">
        <Sheet>
          <div className="flex items-center md:hidden">
            {session?.user ? (
              <SheetTrigger asChild>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session?.user?.image || ''}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full"
                  />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              </SheetTrigger>
            ) : (
              <div className="mr-2">
                <CircleUser
                  className="h-6 w-6 text-gray-500"
                  onClick={() => signIn()}
                />
              </div>
            )}
          </div>

          <div className="mr-[60pt] flex flex-1 items-center justify-end space-x-4 px-12 md:mr-0">
            <div className="hidden md:block">
              {session?.user ? (
                <SheetTrigger asChild>
                  <Avatar className="h-10 w-10 bg-[#7e7b7d]">
                    <AvatarImage
                      src={session?.user?.image || ''}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full"
                    />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </SheetTrigger>
              ) : (
                <div>
                  <RainbowButton
                    onClick={() => signIn()}
                    className="h-10 w-24 text-lg font-semibold hover:font-semibold hover:text-gray-500"
                  >
                    Connect
                  </RainbowButton>
                </div>
              )}
            </div>
            {/* <ModeToggle /> */}
            {/* <LangSwitcher /> */}
          </div>

          <SheetContent side={isMobile ? 'left' : 'right'} className="w-full">
            <SheetHeader className="flex items-center justify-between pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={session?.user.image || ''}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full"
                    />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="bg-gray-100 text-lg font-semibold dark:bg-neutral-800"
                      >
                        {/* {selectedAccount
                              ? `Account ${selectedAccount.index + 1}`
                              : 'Select your domefi account below.'}
                            <ChevronDown className="ml-2 h-4 w-4" /> */}
                        Account 1
                      </Button>
                    </PopoverTrigger>
                    {/* <PopoverContent className="w-[348px] bg-popover p-0">
                          <div className="p-4">
                            <h2 className="mb-2 text-xl font-bold">
                              Your accounts
                            </h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                              Please select your domefi account below.
                            </p>
                            {isLoading ? (
                              <p>Loading...</p>
                            ) : (
                              Accounts &&
                              Accounts.map((account, index) => (
                                <PopoverClose asChild key={account.id}>
                                  <div
                                    className={`mb-2 flex items-center justify-between rounded-md p-2 ${
                                      account.id === selectedAccount?.id
                                        ? 'bg-accent'
                                        : ''
                                    }`}
                                    onClick={() => setSelectedAccount(account)}
                                  >
                                    <span className="text-sm font-medium">
                                      Account {index + 1}
                                    </span>
                                    <span className="mx-2 text-xs text-muted-foreground">
                                      {account.id.slice(0, 8)}...
                                      {account.id.slice(-4)}
                                    </span>
                                    <Badge
                                      variant={
                                        account.accountFlags === 1
                                          ? 'destructive'
                                          : 'secondary'
                                      }
                                    >
                                      <span className="text-xs">
                                        {account.accountFlags === 1
                                          ? 'Disabled'
                                          : 'Active'}
                                      </span>
                                    </Badge>
                                  </div>
                                </PopoverClose>
                              ))
                            )}
                            <Button
                              variant="outline"
                              className="mt-4 w-full"
                              onClick={handleNewAccount}
                            >
                              <Plus className="mr-2 h-4 w-4" /> New Account
                            </Button>
                          </div>
                        </PopoverContent> */}
                  </Popover>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="aspect-square rounded-full p-2"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="aspect-square rounded-full p-2"
                  >
                    <CircleX className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="p-4">
              <TabbedInterface />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
