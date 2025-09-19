// src/components/ui/atoms/Button/Button.tsx
import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import "./Button.css";

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Convenience prop; forwarded to DOM as aria-label */
  ariaLabel?: string;
}

type ButtonProps = BaseButtonProps &
  (
    | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
    | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ariaLabel,
  // strip ariaLabel out of the rest so it doesn't hit the DOM as an invalid attribute
  ...rest
}) => {
  const classes = `btn ${variant} ${size} ${className}`;
  const ariaProps = ariaLabel ? ({ "aria-label": ariaLabel } as const) : {};

  if (href) {
    // Next.js Link renders an <a>; safe to pass aria-label
    return (
      <Link
        href={href}
        className={classes}
        {...ariaProps}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...ariaProps}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};

export default Button;
