# Publicação na conta Cloudflare do cliente

O projeto possui uma configuração própria para Cloudflare Workers. O endereço final pretendido é `https://www.casayamamoto.com.br`; os caminhos existentes, como `/a-casa`, `/guia`, `/eventos`, `/parceiros` e `/admin/agenda`, permanecem iguais.

O site atual no ChatGPT Sites permanece disponível durante a preparação. Preparar o código ou executar uma compilação local não modifica o site publicado.

## Situação da preparação

- Configuração do Worker: `wrangler.cloudflare.jsonc`.
- Comandos portáveis de desenvolvimento, compilação, simulação e publicação: `scripts/cloudflare.mjs`.
- O ID da conta e o ID do banco ainda precisam ser preenchidos com os recursos reais do cliente.
- O domínio ainda precisa ser registrado, se estiver disponível. Registrar `casayamamoto.com.br` também permite usar `www.casayamamoto.com.br`.
- Uma cópia inicial dos dados foi salva em `.wrangler/migration`, fora do Git. Essa pasta contém informações pessoais e deve ser protegida. Ela não substitui a exportação final no momento da troca.
- A cópia de dados não inclui sessões de login ou contadores temporários de tentativas. Os usuários entrarão novamente no novo endereço.
- Os arquivos R2 precisam ser copiados e conferidos separadamente; `uploads.json` é apenas o inventário dos objetos referenciados.

## Conta e domínio

Crie a conta Cloudflare e registre o domínio em nome do cliente. O responsável pelo domínio deve conseguir alterar seus servidores DNS. A conta pode conceder acesso administrativo ao desenvolvedor sem compartilhar a senha do titular.

O registro pode ser iniciado em [Registro.br](https://registro.br/dominio/registrar/). A disponibilidade e o valor serão confirmados pelo registrador antes do pagamento. O subdomínio `www` não exige um segundo registro.

## Compilar e testar sem publicar

Use Node.js 22.13 ou posterior e as dependências já fixadas no `package-lock.json`. Os comandos abaixo não criam recursos remotos nem modificam o DNS:

```powershell
# Compila a aplicação com os recursos definidos para a Cloudflare do cliente.
node scripts/cloudflare.mjs build

# Executa a simulação local do pacote compilado.
node scripts/cloudflare.mjs preview

# Verifica o empacotamento sem publicar o Worker.
node scripts/cloudflare.mjs dry-run
```

Os equivalentes em `package.json` são `build:cloudflare`, `preview:cloudflare` e `dry-run:cloudflare`. O fluxo antigo `build` continua destinado ao Sites.

Para testes de autenticação locais, copie `.dev.vars.example` para `.dev.vars` e preencha os valores diretamente no computador. O arquivo real é ignorado pelo Git. Nunca inclua chaves em commits ou mensagens. Para a implantação remota, configure os segredos diretamente no Worker.

## Criar os recursos após entrar na conta do cliente

Os comandos abaixo são etapas futuras: criam recursos na conta autenticada e só devem ser executados depois de confirmar que ela pertence ao cliente. A habilitação do R2 pode solicitar configuração de faturamento, mesmo quando o uso esperado cabe na franquia gratuita.

```powershell
# Autentica a ferramenta no navegador, sem enviar a senha pelo chat.
node node_modules/wrangler/bin/wrangler.js login

# Confere a conta autenticada antes de criar os recursos.
node node_modules/wrangler/bin/wrangler.js whoami

# Cria o banco do cliente e informa o identificador que será registrado na configuração.
node node_modules/wrangler/bin/wrangler.js d1 create casa-yamamoto-basevi

# Cria o armazenamento das imagens e cartazes enviados pelo painel.
node node_modules/wrangler/bin/wrangler.js r2 bucket create casa-yamamoto-basevi-assets
```

Preencha `account_id` e `d1_databases[0].database_id` em `wrangler.cloudflare.jsonc`. Nenhum desses identificadores é uma chave secreta. O comando de publicação recusa IDs ausentes ou fictícios.

## Migrar banco e arquivos

Antes da troca, suspenda alterações no painel antigo durante a exportação final para evitar divergência entre as duas bases. Atualize a cópia das nove tabelas necessárias. Aplique o esquema no D1 novo e importe os dados apenas depois de validar a cópia localmente:

```powershell
# Gera inserções SQL e o inventário R2 a partir da cópia completa da origem.
node scripts/migration-snapshot.mjs .wrangler/migration/source-snapshot.json .wrangler/migration/data.sql .wrangler/migration/uploads.json

# Aplica o esquema versionado no banco novo do cliente.
node node_modules/wrangler/bin/wrangler.js d1 migrations apply casa-yamamoto-basevi --remote --config wrangler.cloudflare.jsonc

# Importa os registros preservando IDs, vínculos e permissões, sem sobrescrever dados existentes.
node node_modules/wrangler/bin/wrangler.js d1 execute casa-yamamoto-basevi --remote --config wrangler.cloudflare.jsonc --file .wrangler/migration/data.sql
```

Compare contagens, reservas, contas, benefícios e referências de arquivos. Copie cada imagem R2 com sua chave original e seu tipo de conteúdo. Fotos e vídeos existentes em `public/` já fazem parte da compilação; arquivos enviados pelo painel são objetos separados no R2.

## Supabase e acesso administrativo

Mantenha o projeto Supabase já utilizado e os IDs das contas. Configure no novo Worker `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `AUTH_PRIMARY_HOST_ID`. O identificador do administrador precisa coincidir com a identidade confirmada no provedor e com o perfil de anfitrião no D1.

Mantenha `AUTH_PLATFORM_HEADERS_ENABLED=false`. Na Cloudflare pública, cabeçalhos `oai-authenticated-*` enviados pelo navegador não comprovam identidade. Os testes verificam que eles não concedem acesso administrativo. Na hospedagem antiga, essa compatibilidade só pode ser habilitada explicitamente quando a plataforma comprovar a identidade recebida.

Na homologação, ajuste `AUTH_SITE_URL` para a URL de teste, cadastre o retorno exato no Supabase e teste uma conta controlada pelo titular. Na troca definitiva, use o Site URL `https://www.casayamamoto.com.br` e o retorno exato `https://www.casayamamoto.com.br/login?mode=password`. Os templates continuam usando o fragmento `#token_hash=...` já previsto pela integração.

Mantenha `AUTH_EMAIL_ENABLED=false` até confirmar SMTP, templates e entrega na URL nova. Não envie convites a hóspedes reais durante a homologação.

## Publicar e conectar www

Depois de validar os recursos e configurar os segredos, execute `node scripts/cloudflare.mjs deploy`. A primeira publicação usa `workers.dev` e não modifica o domínio definitivo. Teste navegação direta, atualização de página, 404, login, logout, painel, reservas, upload, bloqueios e recuperação de senha.

Somente depois dessa validação, adicione o domínio à Cloudflare, configure os servidores DNS e vincule `www.casayamamoto.com.br` como domínio personalizado do Worker. Configure o domínio sem `www` para redirecionar ao endereço principal preservando caminho e parâmetros. Confira HTTPS e os links de e-mail depois da propagação.

O domínio antigo do ChatGPT não redireciona automaticamente ao novo. Uma eventual mudança ali depende de uma configuração própria e deve ser feita separadamente.

## Custo e operação

O objetivo é usar as franquias gratuitas, mas 100 mil requisições por dia não é o único limite. Verifique também CPU por execução, leituras e escritas do D1, armazenamento e operações R2. A configuração não exige um serviço de transformação de imagens: sem esse binding, o endpoint retorna a imagem original após a validação normal.

Mantenha uma cópia de recuperação e o site antigo até confirmar o funcionamento do destino. Após a troca, evite manter dois painéis editáveis com bancos independentes.
