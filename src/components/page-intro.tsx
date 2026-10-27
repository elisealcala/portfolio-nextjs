import type { ReactNode } from "react";

export function PageIntro({
  title,
  children,
  actions,
  className = "",
}: {
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`page-intro ${className}`}>
      <h1>{title}</h1>
      <div className="intro-bottom">
        <p>{children}</p>
        {actions && <div className="button-row">{actions}</div>}
      </div>
    </section>
  );
}
