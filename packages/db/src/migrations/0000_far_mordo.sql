CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`institution` text,
	`currency` text DEFAULT 'USD' NOT NULL,
	`current_balance` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`parent_id` text,
	`color` text,
	`icon` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `categories_user_idx` ON `categories` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_user_name_unique` ON `categories` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`category_id` text,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`description` text NOT NULL,
	`merchant` text,
	`notes` text,
	`pending` integer DEFAULT false NOT NULL,
	`import_hash` text,
	`raw_data` text,
	`import_batch_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `transactions_user_idx` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `transactions_account_idx` ON `transactions` (`account_id`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`date`);--> statement-breakpoint
CREATE INDEX `transactions_category_idx` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_user_import_hash_unique` ON `transactions` (`user_id`,`import_hash`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text,
	`category_id` text,
	`merchant` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`cadence` text NOT NULL,
	`custom_interval_days` integer,
	`next_billing_date` text,
	`last_charged_date` text,
	`is_active` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `subscriptions_user_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_next_billing_idx` ON `subscriptions` (`next_billing_date`);--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`period` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `budgets_user_idx` ON `budgets` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `budgets_user_category_period_unique` ON `budgets` (`user_id`,`category_id`,`period`,`start_date`);