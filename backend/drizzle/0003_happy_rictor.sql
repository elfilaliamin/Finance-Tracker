ALTER TABLE "incomes" ADD COLUMN "wallet_id" uuid;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incomes_wallet_id_idx" ON "incomes" USING btree ("wallet_id");