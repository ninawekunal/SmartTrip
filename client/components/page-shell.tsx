import { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="container">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </main>
  );
}
