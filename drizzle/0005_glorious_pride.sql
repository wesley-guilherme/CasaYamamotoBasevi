-- Acrescenta contato, localização, origem e valor às reservas e cria as origens de aluguel.
-- Estrutura da tabela rental_origins e suas restrições de integridade.
CREATE TABLE `rental_origins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL
);
--> statement-breakpoint
-- Índice idx_rental_origins_name_key para organizar consultas e restrições dos registros.
CREATE UNIQUE INDEX `idx_rental_origins_name_key` ON `rental_origins` (`name_key`);--> statement-breakpoint
-- Atualiza a estrutura de house_agenda preservando os registros existentes.
ALTER TABLE `house_agenda` ADD `responsible` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Atualiza a estrutura de house_agenda preservando os registros existentes.
ALTER TABLE `house_agenda` ADD `email` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Atualiza a estrutura de house_agenda preservando os registros existentes.
ALTER TABLE `house_agenda` ADD `city` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Atualiza a estrutura de house_agenda preservando os registros existentes.
ALTER TABLE `house_agenda` ADD `state` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Atualiza a estrutura de house_agenda preservando os registros existentes.
ALTER TABLE `house_agenda` ADD `rental_origin` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Atualiza a estrutura de house_agenda preservando os registros existentes.
ALTER TABLE `house_agenda` ADD `rental_amount_cents` integer;
