import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  /**
   * هر صفحه باید دقیقاً یک h1 داشته باشد. عنوان اصلی صفحه as="h1" می‌گیرد
   * و بقیه سرتیترها h2 می‌مانند.
   */
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : "text-start"}`}>
      {eyebrow && <p className="mb-3 text-sm font-bold text-brand-700">{eyebrow}</p>}
      <Heading
        className={
          as === "h1"
            ? "text-2xl font-extrabold leading-[1.5] text-ink-900 sm:text-4xl sm:leading-[1.4]"
            : "text-2xl font-extrabold text-ink-900 sm:text-3xl"
        }
      >
        {title}
      </Heading>
      {description && <p className="mt-4 leading-loose text-ink-600">{description}</p>}
    </div>
  );
}
