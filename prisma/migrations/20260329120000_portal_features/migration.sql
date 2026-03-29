-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TitleAccessType" AS ENUM ('PURCHASE', 'RENTAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN "editorsPick" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Media" ADD COLUMN "purchasePrice" DOUBLE PRECISION;
ALTER TABLE "Media" ADD COLUMN "rentalPrice" DOUBLE PRECISION;
ALTER TABLE "Media" ADD COLUMN "rentalDurationDays" INTEGER NOT NULL DEFAULT 7;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "checkoutSessionId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "stripeWebhookEventId" TEXT;

CREATE UNIQUE INDEX "Payment_stripeWebhookEventId_key" ON "Payment"("stripeWebhookEventId");

-- CreateTable
CREATE TABLE "TitleEntitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "accessType" "TitleAccessType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "checkoutSessionId" TEXT,
    "stripeWebhookEventId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TitleEntitlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TitleEntitlement_checkoutSessionId_key" ON "TitleEntitlement"("checkoutSessionId");
CREATE UNIQUE INDEX "TitleEntitlement_stripeWebhookEventId_key" ON "TitleEntitlement"("stripeWebhookEventId");
CREATE INDEX "TitleEntitlement_userId_mediaId_idx" ON "TitleEntitlement"("userId", "mediaId");

ALTER TABLE "TitleEntitlement" ADD CONSTRAINT "TitleEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TitleEntitlement" ADD CONSTRAINT "TitleEntitlement_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
