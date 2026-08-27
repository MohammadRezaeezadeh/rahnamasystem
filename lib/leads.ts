import "server-only";
import { randomBytes } from "node:crypto";
import { query, queryOne } from "./db";

export type LeadStatus = "new" | "contacted" | "won" | "lost";

export type Lead = {
  id: number;
  public_id: string;
  name: string | null;
  phone: string | null;
  business_type: string | null;
  message: string | null;
  product_slug: string | null;
  preferred_slot: string | null;
  source: string | null;
  score: number;
  status: LeadStatus;
  is_complete: boolean;
  notified: boolean;
  created_at: string;
};

function newPublicId(): string {
  return randomBytes(6).toString("base64url");
}

/** خطایی که یعنی «این بازه همین حالا رزرو شد» — کد یکتایی پستگرس */
export class SlotTakenError extends Error {
  constructor() {
    super("این بازه زمانی همین الان رزرو شد. لطفاً زمان دیگری انتخاب کنید.");
    this.name = "SlotTakenError";
  }
}

export async function createLead(input: {
  name: string;
  phone: string;
  businessType: string | null;
  message: string | null;
  productSlug: string | null;
  preferredSlot: string | null;
  source: string;
}): Promise<Lead> {
  try {
    const rows = await query<Lead>(
      `insert into leads
         (public_id, name, phone, business_type, message, product_slug, preferred_slot, source, is_complete)
       values ($1, $2, $3, $4, $5, $6, $7, $8, true)
       returning *`,
      [
        newPublicId(),
        input.name,
        input.phone,
        input.businessType,
        input.message,
        input.productSlug,
        input.preferredSlot,
        input.source,
      ],
    );
    return rows[0];
  } catch (error) {
    // 23505 = نقض قید یکتایی → یعنی ایندکس leads_slot_unique گرفته است
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new SlotTakenError();
    }
    throw error;
  }
}

export async function markNotified(publicId: string): Promise<void> {
  await query("update leads set notified = true where public_id = $1", [publicId]);
}

/** زمان‌هایی که قبلاً رزرو شده‌اند — برای ساخت فهرست بازه‌های آزاد */
export async function bookedSlots(): Promise<Date[]> {
  const rows = await query<{ preferred_slot: string }>(
    `select preferred_slot from leads
      where preferred_slot is not null
        and status <> 'canceled'
        and preferred_slot > now()`,
  );
  return rows.map((r) => new Date(r.preferred_slot));
}

export async function recentLeads(limit = 100): Promise<Lead[]> {
  return query<Lead>("select * from leads order by created_at desc limit $1", [limit]);
}

/** تماس‌های رزروشده آینده — بالای صفحه سرنخ‌های پنل نمایش داده می‌شود */
export async function upcomingBookings(): Promise<Lead[]> {
  return query<Lead>(
    `select * from leads
      where preferred_slot is not null
        and preferred_slot > now()
        and status not in ('lost')
      order by preferred_slot asc
      limit 20`,
  );
}

export async function setLeadStatus(publicId: string, status: LeadStatus): Promise<void> {
  await query("update leads set status = $2, updated_at = now() where public_id = $1", [
    publicId,
    status,
  ]);
}

export async function getLead(publicId: string): Promise<Lead | null> {
  return queryOne<Lead>("select * from leads where public_id = $1", [publicId]);
}
