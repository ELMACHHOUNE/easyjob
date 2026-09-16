import { cn } from "@/lib/utils"

export default function Logo({
  className,
  withText = true,
  textClassName,
  iconClassName,
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-9 w-9 shrink-0", iconClassName)}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="11" className="fill-primary" />
        <circle
          cx="17.5"
          cy="17.5"
          r="8"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="stroke-primary-foreground"
        />
        <path
          d="M23.5 23.5 30 30"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="stroke-primary-foreground"
        />
        <path
          d="M14.2 13.6c1.4-2 1.4-2.6.6-3.8"
          strokeWidth="1.3"
          strokeLinecap="round"
          className="stroke-primary-foreground"
        />
      </svg>
      {withText && (
        <span className={cn("font-display text-lg font-semibold tracking-tight text-foreground", textClassName)}>
          JobConnect
          <span className="text-primary"> AI</span>
        </span>
      )}
    </span>
  )
}