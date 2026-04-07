import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={clsx(
      "rounded-2xl border border-outline/70 bg-surface p-4 shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
