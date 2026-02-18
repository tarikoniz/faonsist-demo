-- CreateTable
CREATE TABLE "ai_learned_responses" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT,
    "userMessage" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "intent" TEXT,
    "module" TEXT,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "quality" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_learned_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_learned_responses_intent_idx" ON "ai_learned_responses"("intent");

-- CreateIndex
CREATE INDEX "ai_learned_responses_createdAt_idx" ON "ai_learned_responses"("createdAt");

-- CreateIndex
CREATE INDEX "ai_learned_responses_active_idx" ON "ai_learned_responses"("active");
