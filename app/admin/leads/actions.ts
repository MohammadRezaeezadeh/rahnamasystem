"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { setLeadStatus, type LeadStatus } from "@/lib/leads";

const ALLOWED: LeadStatus[] = ["new", "contacted", "won", "lost"];

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  if (!(await currentUser())) return;

  const publicId = String(formData.get("public_id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!publicId || !ALLOWED.includes(status)) return;

  await setLeadStatus(publicId, status);
  revalidatePath("/admin/leads");
}
