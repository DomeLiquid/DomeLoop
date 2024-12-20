'use client';

import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePathname } from '@/navigation';
import { navItems } from '@/config/config';
import { AccountInfo } from '../header';

const MobileFooter = ({
  className,
  user,
}: {
  className: string;
  user: any | null;
}) => {
  const pathname = usePathname();

  return (
    <div className={cn('fixed bottom-0 w-full md:hidden', className)}>
      <div className="flex h-16 items-center justify-between bg-gray-50 px-2 dark:bg-[#111111]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="flex flex-1 justify-center p-2">
              <Link
                href={item.href}
                className={cn(
                  'group flex flex-col items-center gap-2',
                  isActive && 'text-purple-500',
                )}
              >
                <item.icon className={cn('h-6 w-6 font-bold')} />
                <span className={cn('text-sm font-bold')}>{item.label}</span>
              </Link>
            </div>
          );
        })}

        {/* <div className="flex flex-1 justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group flex flex-col items-center gap-2">
                <MoreHorizontal className="h-6 w-6 font-bold group-hover:text-purple-500" />
                <span className="text-sm font-bold group-hover:text-purple-500">
                  More
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <span className="text-sm">Item 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-sm">Item 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-sm">Item 3</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>
    </div>
  );
};

export default MobileFooter;
