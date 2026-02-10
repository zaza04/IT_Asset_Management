import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Shield outline */}
      <path
        d="M16 2L4 7V15C4 22.18 9.12 28.84 16 30C22.88 28.84 28 22.18 28 15V7L16 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Server rack - top */}
      <rect x="10" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="20" cy="12" r="0.8" fill="currentColor" />
      <line x1="12" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Server rack - bottom */}
      <rect x="10" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="20" cy="18" r="0.8" fill="currentColor" />
      <line x1="12" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* Network nodes */}
      <circle cx="16" cy="24" r="1.2" fill="currentColor" />
      <line x1="16" y1="20" x2="16" y2="22.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
