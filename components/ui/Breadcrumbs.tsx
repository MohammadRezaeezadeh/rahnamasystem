import Link from "next/link";
import { Container } from "./Section";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export type Crumb = { name: string; href: string };

/** مسیر صفحه، هم برای کاربر و هم برای گوگل (BreadcrumbList) */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const full: Crumb[] = [{ name: "خانه", href: "/" }, ...trail];

  return (
    <>
      <JsonLd data={breadcrumbSchema(full)} />
      <Container className="pt-6">
        <nav aria-label="مسیر صفحه">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            {full.map((crumb, i) => {
              const last = i === full.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-2">
                  {last ? (
                    <span className="font-semibold text-ink-700" aria-current="page">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className="transition-colors hover:text-brand-700">
                      {crumb.name}
                    </Link>
                  )}
                  {!last && <span aria-hidden className="text-ink-300">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </>
  );
}
