-- CreateTable
CREATE TABLE "user_behavior_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_behavior_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_behavior_events_tenant_id_idx" ON "user_behavior_events"("tenant_id");

-- CreateIndex
CREATE INDEX "user_behavior_events_tenant_id_user_id_idx" ON "user_behavior_events"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "user_behavior_events_tenant_id_user_id_event_idx" ON "user_behavior_events"("tenant_id", "user_id", "event");

-- CreateIndex
CREATE INDEX "user_behavior_events_tenant_id_user_id_created_at_idx" ON "user_behavior_events"("tenant_id", "user_id", "created_at");
