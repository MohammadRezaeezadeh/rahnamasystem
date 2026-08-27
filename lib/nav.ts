import { productsSorted } from "./products";

export type NavItem = {
  label: string;
  href: string;
  /** زیرمنو - در دسکتاپ dropdown، در موبایل آکاردئون */
  children?: { label: string; href: string; description?: string }[];
};

export const mainNav: NavItem[] = [
  { label: "خانه", href: "/" },
  {
    label: "محصولات",
    href: "/products",
    children: productsSorted.map((p) => ({
      label: p.shortName,
      href: `/products/${p.slug}`,
      description: p.summary,
    })),
  },
  { label: "مشاوره و دمو", href: "/consultation" },
  { label: "وبلاگ", href: "/blog" },
  { label: "تماس با ما", href: "/contact" },
];

export const footerNav: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "محصولات سپیدار",
    links: productsSorted.map((p) => ({ label: p.shortName, href: `/products/${p.slug}` })),
  },
  {
    title: "خدمات ما",
    links: [
      { label: "مشاوره انتخاب بسته", href: "/consultation" },
      { label: "رزرو زمان تماس", href: "/consultation#booking" },
      { label: "وبلاگ و آموزش", href: "/blog" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
];
