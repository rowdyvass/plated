import { ReactNode } from 'react';
import { BackButton } from './BackButton';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  rightContent?: ReactNode;
}

export function Header({ title, showBack = false, backTo, rightContent }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-foundation-100/80 backdrop-blur-sm">
      <div className="w-10">
        {showBack && <BackButton to={backTo} />}
      </div>
      {title && (
        <h1 className="font-display text-xl text-text-primary">{title}</h1>
      )}
      <div className="w-10 flex justify-end">
        {rightContent}
      </div>
    </header>
  );
}
