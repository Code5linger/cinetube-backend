-- Backfill checkoutSessionId for subscription payments created before that column existed
UPDATE "Payment"
SET "checkoutSessionId" = "gatewayTxnId"
WHERE "checkoutSessionId" IS NULL
  AND "gatewayTxnId" IS NOT NULL;
