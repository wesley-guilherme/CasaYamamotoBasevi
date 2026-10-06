CREATE TABLE `rental_origins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_rental_origins_name_key` ON `rental_origins` (`name_key`);--> statement-breakpoint
ALTER TABLE `house_agenda` ADD `responsible` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `house_agenda` ADD `email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `house_agenda` ADD `city` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `house_agenda` ADD `state` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `house_agenda` ADD `rental_origin` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `house_agenda` ADD `rental_amount_cents` integer;