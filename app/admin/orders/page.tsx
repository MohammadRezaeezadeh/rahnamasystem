import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { recentOrders } from "@/lib/orders";
import { formatPrice, formatDateFa } from "@/lib/format";
import { StatusPill } from "../page";

export const dynamic = "force-dynamic";

const providerLabel: Record<string, string> = {
  zarinpal: "زرین‌پال",
  snappay: "اسنپ‌پی",
};

export default async function OrdersPage() {
  if (!(await currentUser())) redirect("/admin/login");

  const orders = await recentOrders(100);

  return (
    <>
      <h1 className="text-xl font-extrabold text-ink-900">سفارش‌ها</h1>
      <p className="mt-2 text-sm text-ink-600">
        سفارش‌های «در انتظار» یعنی کاربر به درگاه رفته ولی پرداخت را کامل نکرده — این‌ها سرنخ
        قابل پیگیری‌اند، نه سفارش سوخته.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-card border border-ink-200 bg-white p-6 text-sm text-ink-500">
          هنوز سفارشی ثبت نشده است.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-card border border-ink-200 bg-white">
          <table className="w-full min-w-[46rem] text-start text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-xs text-ink-500">
              <tr>
                <Th>تاریخ</Th>
                <Th>محصول</Th>
                <Th>خریدار</Th>
                <Th>تلفن</Th>
                <Th>مبلغ</Th>
                <Th>درگاه</Th>
                <Th>وضعیت</Th>
                <Th>پیگیری</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((o) => (
                <tr key={o.public_id} className="hover:bg-ink-50">
                  <Td className="whitespace-nowrap text-xs text-ink-500">
                    {formatDateFa(o.created_at)}
                  </Td>
                  <Td className="font-semibold text-ink-900">{o.product_name}</Td>
                  <Td>{o.customer_name}</Td>
                  <Td>
                    <a href={`tel:${o.customer_phone}`} className="ltr tnum hover:text-brand-700">
                      {o.customer_phone}
                    </a>
                  </Td>
                  <Td className="tnum whitespace-nowrap font-bold">{formatPrice(o.amount_toman)}</Td>
                  <Td className="text-xs">{providerLabel[o.provider] ?? o.provider}</Td>
                  <Td>
                    <StatusPill status={o.status} />
                  </Td>
                  <Td className="ltr tnum text-xs text-ink-500">{o.payment_ref ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-start font-bold">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
