import { Hexagon } from '@phosphor-icons/react'
import type { LogoGlobalProps } from './tipos.js'
import './logo-global.css'

export function LogoGlobal({ 
  className = '', 
  iconOnly = false,
  iconSize = 28,
  iconColor,
  hideText = false
}: LogoGlobalProps) {
  return (
    <div className={`logo-global ${className}`.trim()}>
      <div className="logo-global__mark" aria-hidden="true">
        <Hexagon 
          size={iconSize} 
          weight="duotone" 
          color={iconColor || "currentColor"} 
        />
      </div>
      {!iconOnly && (
        <span className={`logo-global__text ${hideText ? 'logo-global__text--hidden' : ''}`}>
          Gravity
        </span>
      )}
    </div>
  )
}
