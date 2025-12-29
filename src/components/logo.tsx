import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showText?: boolean;
  href?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24, textSize: 'text-sm' },
  md: { width: 32, height: 32, textSize: 'text-base' },
  lg: { width: 40, height: 40, textSize: 'text-lg' },
  xl: { width: 48, height: 48, textSize: 'text-xl' },
  hero: { width: 64, height: 64, textSize: 'text-4xl md:text-6xl' }
};

export function Logo({ 
  size = 'md', 
  className, 
  showText = true, 
  href = '/' 
}: LogoProps) {
  const { width, height, textSize } = sizeMap[size];
  
  const logoContent = (
    <div className={cn('flex items-center space-x-2', className)}>
      <Image
        src="/logo.svg"
        alt="FlashyCardy Logo"
        width={width}
        height={height}
        priority
        className="shrink-0"
      />
      {showText && (
        <span className={cn('font-semibold text-foreground', textSize)}>
          FlashyCardy
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href}
        className="hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
