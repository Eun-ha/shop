import React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium tracking-wide text-on-surface/70">{label}</label>}
    <input
      className={clsx(
        "h-11 rounded-xl border border-outline bg-surface px-3 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-variant disabled:text-on-surface/50",
        error ? "border-sale" : "border-outline",
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-sale">{error}</span>}
  </div>
);
