import { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  reason: string;
  unlockPath: string;
  className?: string;
};

export function LockedActionButton({ children, reason, unlockPath, className = '' }: Props) {
  return (
    <div className="relative inline-block group">
      <button
        disabled
        className={`opacity-50 cursor-not-allowed flex items-center gap-2 ${className}`}
        aria-disabled="true"
      >
        <span aria-hidden>🔒</span>
        {children}
      </button>
      <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 z-10 bg-popover border rounded p-2 shadow text-sm min-w-48">
        <p className="text-foreground">{reason}</p>
        <a href={unlockPath} className="text-primary text-xs underline mt-1 block">
          Upload documents →
        </a>
      </div>
    </div>
  );
}
