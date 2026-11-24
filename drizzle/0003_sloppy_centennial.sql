-- Acrescenta os links de Instagram e WhatsApp ao cadastro de parceiros.
-- Atualiza a estrutura de partners preservando os registros existentes.
ALTER TABLE `partners` ADD `instagram_url` text;--> statement-breakpoint
-- Atualiza a estrutura de partners preservando os registros existentes.
ALTER TABLE `partners` ADD `whatsapp_url` text;
