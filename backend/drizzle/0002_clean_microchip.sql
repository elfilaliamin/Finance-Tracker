CREATE TABLE "wallet_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"from_wallet_id" uuid NOT NULL,
	"to_wallet_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"from_currency" varchar(3) NOT NULL,
	"target_amount" numeric(14, 2) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"exchange_rate" numeric(18, 6) DEFAULT '1.000000' NOT NULL,
	"transfer_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_transfers" ADD CONSTRAINT "wallet_transfers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transfers" ADD CONSTRAINT "wallet_transfers_from_wallet_id_wallets_id_fk" FOREIGN KEY ("from_wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transfers" ADD CONSTRAINT "wallet_transfers_to_wallet_id_wallets_id_fk" FOREIGN KEY ("to_wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transfers" ADD CONSTRAINT "wallet_transfers_from_currency_currencies_code_fk" FOREIGN KEY ("from_currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transfers" ADD CONSTRAINT "wallet_transfers_to_currency_currencies_code_fk" FOREIGN KEY ("to_currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wallet_transfers_user_id_idx" ON "wallet_transfers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wallet_transfers_from_wallet_idx" ON "wallet_transfers" USING btree ("from_wallet_id");--> statement-breakpoint
CREATE INDEX "wallet_transfers_to_wallet_idx" ON "wallet_transfers" USING btree ("to_wallet_id");--> statement-breakpoint
CREATE INDEX "wallet_transfers_date_idx" ON "wallet_transfers" USING btree ("transfer_date");