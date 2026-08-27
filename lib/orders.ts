import "server-only";
import { randomBytes } from "node:crypto";
import { query, queryOne } from "./db";
import type { ProviderId } from "./payments/types";

export type OrderStatus = "pending" | "paid" | "failed" | "canceled";

export type Order = {
  id: number;
  public_id: string;
  product_slug: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  amount_toman: number;
  provider: ProviderId;
  status: OrderStatus;
  provider_ref: string | null;
  payment_ref: string | null;
  error_message: string | null;
  created_at: string;
  paid_at: string | null;
};

type Row = Omit<Order, "amount_toman"> & { amount_toman: string };

const toOrder = (r: Row): Order => ({ ...r, amount_toman: Number(r.amount_toman) });

/** شناسه عمومی سفارش — در URL بازگشت درگاه دیده می‌شود، پس نباید قابل حدس باشد */
function newPublicId(): string {
  return randomBytes(9).toString("base64url");
}

export async function createOrder(input: {
  productSlug: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  amountToman: number;
  provider: ProviderId;
}): Promise<Order> {
  const rows = await query<Row>(
    `insert into orders
       (public_id, product_slug, product_name, customer_name, customer_phone, amount_toman, provider)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      newPublicId(),
      input.productSlug,
      input.productName,
      input.customerName,
      input.customerPhone,
      input.amountToman,
      input.provider,
    ],
  );
  return toOrder(rows[0]);
}

export async function getOrder(publicId: string): Promise<Order | null> {
  const row = await queryOne<Row>("select * from orders where public_id = $1", [publicId]);
  return row ? toOrder(row) : null;
}

export async function setProviderRef(publicId: string, providerRef: string): Promise<void> {
  await query("update orders set provider_ref = $2 where public_id = $1", [publicId, providerRef]);
}

/**
 * ثبت پرداخت موفق.
 *
 * شرط `status = 'pending'` عمدی است: اگر کاربر صفحه بازگشت را دوبار باز کند،
 * ردیف بار دوم به‌روز نمی‌شود و paid_at دست‌نخورده می‌ماند.
 */
export async function markPaid(publicId: string, paymentRef: string): Promise<void> {
  await query(
    `update orders
        set status = 'paid', payment_ref = $2, paid_at = now(), error_message = null
      where public_id = $1 and status = 'pending'`,
    [publicId, paymentRef],
  );
}

export async function markFailed(
  publicId: string,
  error: string,
  canceled = false,
): Promise<void> {
  await query(
    `update orders
        set status = $3, error_message = $2
      where public_id = $1 and status = 'pending'`,
    [publicId, error, canceled ? "canceled" : "failed"],
  );
}

/** آخرین سفارش‌ها برای پنل مدیریت */
export async function recentOrders(limit = 50): Promise<Order[]> {
  const rows = await query<Row>("select * from orders order by created_at desc limit $1", [limit]);
  return rows.map(toOrder);
}
