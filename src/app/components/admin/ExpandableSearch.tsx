import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

interface ExpandableSearchProps {
  className?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function ExpandableSearch({
  className,
  placeholder,
  value,
  onChange,
}: ExpandableSearchProps) {
  const [isOpen, setIsOpen] = useState(Boolean(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setIsOpen(true);
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen && !value.trim()) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 44 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn(
        'flex h-11 items-center overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm',
        className
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Tutup pencarian' : 'Buka pencarian'}
        aria-expanded={isOpen}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="h-4 w-4" />
      </button>

      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 12 }}
        transition={{ duration: 0.18 }}
        className="min-w-0 flex-1 pr-3"
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (!value.trim()) {
              setIsOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !value.trim()) {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          className="h-8 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </motion.div>
    </motion.div>
  );
}
