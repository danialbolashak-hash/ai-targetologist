-- ============================================================
--  Row Level Security (RLS) для AI Targetologist
--  Запускать в Supabase → SQL Editor (или через psql).
--  Защищает данные на уровне БД: даже если утечёт anon-ключ,
--  пользователь видит ТОЛЬКО свои строки.
-- ============================================================

-- Помощник: текущий пользователь из JWT (Supabase прокидывает auth.uid())
-- В нашей схеме User.supabaseId == auth.uid()

-- ─── USERS ───────────────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_self_select" ON "User";
CREATE POLICY "users_self_select" ON "User"
  FOR SELECT USING ( "supabaseId" = auth.uid()::text );

DROP POLICY IF EXISTS "users_self_update" ON "User";
CREATE POLICY "users_self_update" ON "User"
  FOR UPDATE USING ( "supabaseId" = auth.uid()::text );

-- ─── BUSINESS PROFILES ───────────────────────────────────────
ALTER TABLE "BusinessProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bp_owner_all" ON "BusinessProfile";
CREATE POLICY "bp_owner_all" ON "BusinessProfile"
  FOR ALL USING (
    "userId" IN (SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text)
  );

-- ─── FACEBOOK ACCOUNTS ───────────────────────────────────────
ALTER TABLE "FacebookAccount" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fb_owner_all" ON "FacebookAccount";
CREATE POLICY "fb_owner_all" ON "FacebookAccount"
  FOR ALL USING (
    "userId" IN (SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text)
  );

-- ─── CAMPAIGNS (через business) ──────────────────────────────
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_owner_all" ON "Campaign";
CREATE POLICY "campaign_owner_all" ON "Campaign"
  FOR ALL USING (
    "businessId" IN (
      SELECT bp.id FROM "BusinessProfile" bp
      JOIN "User" u ON u.id = bp."userId"
      WHERE u."supabaseId" = auth.uid()::text
    )
  );

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub_owner_select" ON "Subscription";
CREATE POLICY "sub_owner_select" ON "Subscription"
  FOR SELECT USING (
    "userId" IN (SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text)
  );

-- ─── AUDIT LOG — только чтение своих, запись только сервером ──
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
-- (нет политик для anon = доступ только через service_role с сервера)

-- ============================================================
--  ВАЖНО: сервер (Prisma) ходит под прямым DATABASE_URL и
--  обходит RLS — это нормально, вся бизнес-логика уже проверяет
--  владение через requireApiUser/ownsResource.
--  RLS = защита от прямого доступа по anon-ключу из браузера.
-- ============================================================
