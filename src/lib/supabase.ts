import { createClient } from "@supabase/supabase-js";

/**
 * این کلاینت به پایگاه‌داده‌ای وصل می‌شود که جدول‌های `projects` و
 * `analysis_reports` در آن ساخته شده‌اند (همان پروژه‌ای که کد و داده‌های
 * فعلی در آن ثبت شده است). آدرس آن به‌صورت ثابت تعریف شده تا با فعال شدن
 * بک‌اند دیگر، اتصال جابه‌جا نشود و خطای «جدول پیدا نشد» رخ ندهد.
 */
const supabaseUrl = "https://hdbymzyajzcyraitibyo.supabase.co";
const supabaseAnonKey = "sb_publishable_gqqHsxmAGY0I93Pdk3MDrw_vvRvEotK";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
