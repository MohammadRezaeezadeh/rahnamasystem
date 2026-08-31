"use server";

import { revalidatePath } from "next/cache";
import { currentUser, changePassword, addAdmin } from "@/lib/auth";

export type SettingsState = { error?: string; success?: string };

export async function changePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await currentUser();
  if (!user) return { error: "نشست شما منقضی شده. دوباره وارد شوید." };

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!current || !next) return { error: "هر دو فیلد رمز را پر کنید." };
  if (next !== confirm) return { error: "رمز جدید و تکرارش یکی نیستند." };
  if (next === current) return { error: "رمز جدید با رمز فعلی فرقی ندارد." };

  const result = await changePassword(user.id, current, next);
  if (!result.ok) return { error: result.error };

  return { success: "رمز عبور تغییر کرد." };
}

export async function addAdminAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!(await currentUser())) return { error: "نشست شما منقضی شده. دوباره وارد شوید." };

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");

  const result = await addAdmin(username, password, displayName || null);
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/settings");
  return { success: `کاربر «${username.trim().toLowerCase()}» ساخته شد.` };
}
