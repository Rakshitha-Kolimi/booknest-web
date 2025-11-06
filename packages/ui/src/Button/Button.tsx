import './button.css'

import { cn } from '@booknest/utils'
import React from 'react'

type ButtonProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
}

export function Button(props: ButtonProps): React.ReactElement {
  const { label, className, disabled, style, type, onClick } = props
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={style}
      type={type}
      className={cn('btn', className)}
    >
      {label}
    </button>
  )
}
