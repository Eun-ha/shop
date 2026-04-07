import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}) => {
  return (
    <button
      className={clsx(
        "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-primary text-on-primary hover:opacity-90": variant === "primary",
          "bg-surface-variant text-on-surface hover:opacity-90": variant === "secondary",
          "border border-outline bg-surface text-on-surface hover:bg-surface-variant": variant === "outline",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
