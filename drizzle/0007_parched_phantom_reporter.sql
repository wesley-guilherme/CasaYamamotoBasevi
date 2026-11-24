-- Cria contas, sessões, vínculos de reserva, auditoria e limites de tentativas para acessos individuais.
-- Estrutura da tabela access_accounts e suas restrições de integridade.
CREATE TABLE `access_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`blocked` integer DEFAULT 0 NOT NULL,
	`verified_at` text,
	`invited_at` text,
	`last_login_at` text,
	CONSTRAINT "access_accounts_role" CHECK("access_accounts"."role" IN ('host', 'guest', 'partner'))
);
--> statement-breakpoint
-- Índice access_accounts_email para organizar consultas e restrições dos registros.
CREATE UNIQUE INDEX `access_accounts_email` ON `access_accounts` (`email`);--> statement-breakpoint
-- Índice access_accounts_auth_id para organizar consultas e restrições dos registros.
CREATE UNIQUE INDEX `access_accounts_auth_id` ON `access_accounts` (`auth_id`);--> statement-breakpoint
-- Estrutura da tabela access_audit e suas restrições de integridade.
CREATE TABLE `access_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`account_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- Estrutura da tabela access_rate_limits e suas restrições de integridade.
CREATE TABLE `access_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
-- Estrutura da tabela access_reservations e suas restrições de integridade.
CREATE TABLE `access_reservations` (
	`reservation_id` integer PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	FOREIGN KEY (`reservation_id`) REFERENCES `house_agenda`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `access_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Índice access_reservations_account para organizar consultas e restrições dos registros.
CREATE INDEX `access_reservations_account` ON `access_reservations` (`account_id`);--> statement-breakpoint
-- Estrutura da tabela access_sessions e suas restrições de integridade.
CREATE TABLE `access_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `access_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Índice access_sessions_account para organizar consultas e restrições dos registros.
CREATE INDEX `access_sessions_account` ON `access_sessions` (`account_id`);--> statement-breakpoint
-- Índice access_sessions_expiry para organizar consultas e restrições dos registros.
CREATE INDEX `access_sessions_expiry` ON `access_sessions` (`expires_at`);