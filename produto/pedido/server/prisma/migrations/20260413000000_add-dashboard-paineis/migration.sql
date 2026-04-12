-- CreateTable
CREATE TABLE "dashboard_paineis" (
    "id"           TEXT NOT NULL,
    "tenant_id"    TEXT NOT NULL,
    "user_id"      TEXT NOT NULL,
    "nome"         TEXT NOT NULL,
    "ordem"        INTEGER NOT NULL DEFAULT 0,
    "is_visivel"   BOOLEAN NOT NULL DEFAULT true,
    "widgets_json" TEXT NOT NULL DEFAULT '[]',
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_paineis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dashboard_paineis_tenant_id_idx" ON "dashboard_paineis"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_paineis_tenant_id_user_id_idx" ON "dashboard_paineis"("tenant_id", "user_id");
