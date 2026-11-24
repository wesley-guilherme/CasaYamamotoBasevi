-- Acrescenta a referência de cartaz ao cadastro de eventos.
-- Atualiza a estrutura de events preservando os registros existentes.
ALTER TABLE `events` ADD `poster_key` text;