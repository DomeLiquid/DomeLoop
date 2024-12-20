import React from 'react';

import {
  IconCopy,
  IconCheck,
  IconShare,
  IconBrandXFilled,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandReddit,
} from '@tabler/icons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { GroupData } from '@/app/stores/tradeStore';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Link } from '@/navigation';

const shareLinks = [
  {
    icon: IconBrandXFilled,
    url: 'https://twitter.com/intent/tweet?url={url}&text={text}',
  },
  {
    icon: IconBrandTelegram,
    url: 'https://t.me/share/url?url={url}&text={text}',
  },
  {
    icon: IconBrandWhatsapp,
    url: 'https://wa.me/?text={text}%20-%20{url}',
  },
  {
    icon: IconBrandReddit,
    url: 'https://reddit.com/submit/?url={url}&amp;resubmit=true&amp;title={text}',
  },
];

const buildShareUrl = (link: string, url: string, text: string) => {
  return link.replace('{url}', url).replace('{text}', text);
};

type PoolShareProps = {
  activeGroup: GroupData;
};

export const PoolShare = ({ activeGroup }: PoolShareProps) => {
  const [isUrlCopied, setIsUrlCopied] = React.useState(false);
  const copyUrlRef = React.useRef<HTMLInputElement>(null);

  const handleCopyUrl = () => {
    setIsUrlCopied(true);
    setTimeout(() => {
      setIsUrlCopied(false);
    }, 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="mt-4">
          <IconShare size={16} /> Share {activeGroup.pool.token.token.symbol}{' '}
          pool
        </Button>
      </PopoverTrigger>
      <PopoverContent className="pb-2">
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-1.5">
            <input
              ref={copyUrlRef}
              className="w-full select-all appearance-none overflow-auto rounded-md border bg-background px-2 py-1 text-xs outline-none"
              value={`${window.location.origin}/trade/${activeGroup.groupId}`}
              readOnly
            />
            <CopyToClipboard
              text={`${window.location.origin}/trade/${activeGroup.groupId}`}
            >
              <button
                onClick={handleCopyUrl}
                className="cursor-pointer rounded-md p-2 transition-colors hover:bg-accent"
              >
                {isUrlCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </button>
            </CopyToClipboard>
          </div>
          <div className="flex items-center gap-2 pl-0.5 text-xs">
            <span className="-translate-y-0.5 font-medium">Share to:</span>
            <ul className="flex items-center justify-center gap-1">
              {shareLinks.map((link, index) => {
                const url = `${window.location.origin}/trade/${activeGroup.groupId}`;
                const text = `Long / short ${activeGroup.pool.token.token.symbol} with leverage in The Arena`;
                return (
                  <li key={index}>
                    <Link
                      href={buildShareUrl(link.url, url, text)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block cursor-pointer rounded-md p-2 transition-colors hover:bg-accent"
                    >
                      <link.icon size={16} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
