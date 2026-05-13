import * as React from "react";
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={`p-6 flex flex-col space-y-1.5 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h2 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
}


export function CardDescription({ children, className }: CardProps) {
  return <p className={`text-sm text-slate-500 ${className}`}>{children}</p>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}