CREATE TABLE `home_event_card` (
	`id` integer PRIMARY KEY NOT NULL,
	`month` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "home_event_card_singleton" CHECK("home_event_card"."id" = 1),
	CONSTRAINT "home_event_card_month" CHECK("home_event_card"."month" BETWEEN 1 AND 12)
);
