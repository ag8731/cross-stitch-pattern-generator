'use client';

interface HeaderProps {
  onNewPattern?: () => void;
  hasPattern?: boolean;
}

export default function Header({ onNewPattern, hasPattern }: HeaderProps) {
  return (
    <header className="bg-linen border-b border-rose-light shadow-[0_1px_4px_rgba(61,61,61,0.04)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="thread">
              🧵
            </span>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight">
                Katia&apos;s Cross Stitch
              </h1>
              <p className="text-xs text-warm-gray hidden sm:block">
                Pattern Generator
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {hasPattern && onNewPattern && (
              <button
                onClick={onNewPattern}
                className="text-sm text-warm-gray hover:text-charcoal transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Pattern
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
