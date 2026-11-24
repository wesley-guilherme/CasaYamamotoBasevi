-- Cria a tabela de eventos e seus índices de consulta e publicação.
-- Estrutura da tabela events e suas restrições de integridade.
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`start_time` text,
	`location` text DEFAULT 'Prado — BA' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`details_url` text,
	`published` integer DEFAULT false NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- Índice idx_events_published_dates para organizar consultas e restrições dos registros.
CREATE INDEX `idx_events_published_dates` ON `events` (`published`,`start_date`,`end_date`);