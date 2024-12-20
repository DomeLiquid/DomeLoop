import { cn } from '@/lib/utils';
import { Link } from '@/navigation';
import { motion } from 'framer-motion';

interface PageHeadingProps {
  heading: JSX.Element | string;
  body?: JSX.Element;
  links?: {
    href: string;
    icon: JSX.Element;
  }[];
  button?: JSX.Element;
  size?: 'md' | 'lg';
  animate?: boolean;
}

export const PageHeading = ({
  heading,
  body,
  links,
  button,
  size = 'md',
  animate = false,
}: PageHeadingProps) => {
  return (
    <div
      className={cn(
        'space-y-3 px-2 pb-10 pt-4 text-center text-base text-muted-foreground md:px-0 md:pt-0 md:text-lg',
        size === 'lg' && 'space-y-5 text-lg text-primary/80 md:text-2xl',
      )}
    >
      <motion.h1
        className={cn(
          'font-orbitron text-5xl font-medium text-primary',
          size === 'lg' && 'text-5xl md:text-6xl',
        )}
        initial={{ opacity: animate ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {heading}
      </motion.h1>
      <motion.div
        className="mx-auto w-full max-w-2xl"
        initial={{ opacity: animate ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {body}
      </motion.div>

      {links && links.length > 0 && (
        <ul className="flex items-center justify-center gap-4 pt-2">
          {links.map((link, idx) => (
            <li key={idx}>
              <Link
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-chartreuse"
              >
                {link.icon}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {button && <div className="flex justify-center pt-4">{button}</div>}
    </div>
  );
};
