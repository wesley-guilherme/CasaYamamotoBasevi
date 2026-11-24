-- Cria a agenda de reservas e feriados e os índices de consulta por período.
-- Estrutura da tabela house_agenda e suas restrições de integridade.
CREATE TABLE `house_agenda` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- Índice idx_house_agenda_kind_dates para organizar consultas e restrições dos registros.
CREATE INDEX `idx_house_agenda_kind_dates` ON `house_agenda` (`kind`,`published`,`start_date`,`end_date`);