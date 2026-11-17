# Acesso individual — Casa Yamamoto Basevi

## Serviço e configuração

O Supabase Auth verifica e-mails, armazena os hashes das senhas e valida convites e recuperação. Nenhuma senha é gravada no D1. As reservas continuam no D1 da hospedagem Sites. A tela de login apresenta somente o acesso por e-mail e senha. A integração nativa da plataforma permanece como compatibilidade interna, sem link no formulário.

Configure estes segredos na hospedagem, sem incluí-los no código ou em mensagens:

- `SUPABASE_URL`: URL HTTPS do projeto Supabase.
- `SUPABASE_ANON_KEY`: chave pública/anon do projeto, usada apenas no servidor desta integração.
- `SUPABASE_SERVICE_ROLE_KEY`: chave secreta/service_role, exclusiva do servidor.
- `AUTH_PRIMARY_HOST_ID`: ID da identidade Supabase do administrador principal, configurado exclusivamente no servidor. O ID e o e-mail administrativo devem coincidir; nenhum metadado ou campo enviado pelo navegador concede esse perfil.
- `AUTH_SITE_URL`: `https://casa-yamamoto-basevi.wesley-analistasyste.chatgpt.site`.

No Supabase, habilite e-mail/senha, confirmação de e-mail, desabilite cadastros públicos e contas anônimas. Configure no Supabase o mínimo de 8 caracteres. O site exige de 8 a 12 caracteres com pelo menos uma letra maiúscula, um número e um caractere especial ao criar ou recuperar senha. Senhas anteriores continuam válidas no login, sem truncamento. Configure limites de tentativas, expiração dos tokens de e-mail (recomendado: 1 hora) e as notificações de alteração de senha. Use um projeto dedicado para este site.

Configure SMTP de produção com remetente e domínio verificados. O remetente padrão do Supabase tem restrições e não deve ser considerado um serviço de entrega de produção. Não envie convites a hóspedes reais durante testes.

Site URL: a URL de produção acima. Allow list de redirecionamento: a URL exata `https://casa-yamamoto-basevi.wesley-analistasyste.chatgpt.site/login?mode=password`. Não use curingas em produção.

## Projeto provisionado

Projeto `casa-yamamoto-basevi` (`uuooosxbiguzyqwvinoi`), organização `mkrnutopfsogdnrwzxus`, região São Paulo (`sa-east-1`), criado com custo mensal zero confirmado pelo usuário.

Painel: https://supabase.com/dashboard/project/uuooosxbiguzyqwvinoi.

O usuário definiu `casayamamotobasevi@gmail.com` como remetente. Manter `AUTH_EMAIL_ENABLED=false` até configurar e testar o SMTP e os templates. A chave controla somente o envio de convites e recuperação; contas já ativadas continuam usando seu login normal. A substituição definitiva dos acessos continua pendente dessa configuração.

Configuração SMTP salva pelo titular no Supabase, com entrega ainda pendente de teste:

- Remetente: `casayamamotobasevi@gmail.com`.
- Nome do remetente: `Casa Yamamoto Basevi`.
- Servidor: `smtp.gmail.com`.
- Porta: `465`, com TLS.
- Usuário: `casayamamotobasevi@gmail.com`.
- Senha: senha de app gerada pelo titular da conta Google, com verificação em duas etapas habilitada. Inserir diretamente no campo SMTP do Supabase; não enviar pelo chat, gravar no código ou usar a senha principal do Gmail.
- Painel SMTP: https://supabase.com/dashboard/project/uuooosxbiguzyqwvinoi/auth/smtp.

A senha de app foi inserida diretamente pelo titular no Supabase e não deve ser copiada para este repositório. O aviso do painel sobre provedor pessoal é um alerta de entregabilidade; salvar a configuração não comprova a entrega. Os envios iniciais de validação usaram endereços controlados pelo titular, incluindo o administrador principal. Não enviar a hóspedes reais antes da validação.

A URL, a chave pública, a chave secreta exclusiva do backend, a URL de retorno do site e a opção de envio desativado foram registrados nas variáveis da hospedagem. A chave secreta foi aceita pela API administrativa do Supabase. O Supabase aceitou o envio do convite controlado. O titular confirmou o recebimento e ativou o acesso do administrador principal.

No painel Supabase foram salvos o Site URL de produção, o retorno exato para `/login?mode=password` e os modelos de convite e recuperação em português com a identidade visual da Casa. Cadastros públicos e contas anônimas estão desativados; a confirmação de e-mail está ativa. A política solicitada exige mínimo de 8 no provedor e validação de 8 a 12 com composição no site; a validade do link permanece em uma hora.

## Templates obrigatórios

O fluxo usa o TokenHash em um fragmento de URL, para não enviá-lo aos servidores de páginas, logs de acesso ou referrers. O GET da página não consome o token: somente o envio explícito do formulário o valida no Supabase. Os templates padrão do Supabase não são compatíveis com este fluxo; configure ambos antes de habilitar o serviço.

Template de convite (Invite user):

```html
<h2>Seu acesso à Casa Yamamoto Basevi</h2>
<p>Você recebeu um convite para acessar sua conta.</p>
<p><a href="{{ .SiteURL }}/login?mode=password#token_hash={{ .TokenHash }}&amp;type=invite">Confirmar e-mail e criar senha</a></p>
<p>Se você não esperava este convite, desconsidere esta mensagem.</p>
```

Template de recuperação (Reset password):

```html
<h2>Recupere seu acesso</h2>
<p><a href="{{ .SiteURL }}/login?mode=password#token_hash={{ .TokenHash }}&amp;type=recovery">Criar nova senha</a></p>
<p>Se você não pediu esta alteração, desconsidere esta mensagem.</p>
```

## Contas e permissões

- Administrador principal: `casayamamotobasevi@gmail.com`, pelo login ChatGPT já autorizado ou por e-mail e senha após confirmar o convite. O acesso por senha exige o ID Supabase vinculado no servidor em `AUTH_PRIMARY_HOST_ID`, o mesmo e-mail confirmado e o perfil anfitrião no D1. Pode convidar anfitriões e gerenciar as contas.
- Anfitrião: convidado exclusivamente pelo administrador principal. Gerencia o painel e os acessos de hóspedes; não gerencia outros anfitriões.
- Hóspede: convidado a partir de uma reserva salva ou diretamente pelo administrador principal. Uma conta por e-mail, independente das reservas. Convites emitidos pela API administrativa ou pelo painel do Supabase ativam contas de hóspedes, com a única exceção da identidade do administrador principal explicitamente vinculada no servidor: o primeiro acesso exige confirmação de e-mail e `invited_at` emitido pelo Auth. Metadados editáveis nunca concedem outro perfil. Uma conta sem reserva não libera benefícios. O hóspede só consulta os próprios períodos, sem notas internas, valores ou dados de outras pessoas.
- Parceiro: perfil reservado, sem endpoint de convite e sem autorização de entrada nesta versão.
- Os benefícios dependem de uma reserva publicada vinculada à conta, com e-mail correspondente, desde o dia da entrada até o fim do dia da saída, no fuso de Bahia. A conta permanece após a estadia. Alterar o e-mail da reserva suspende a vinculação anterior; é necessário reenviar o convite para vincular o endereço correto.

As permissões vêm do D1, nunca de campos enviados pelo navegador ou metadados editáveis do Supabase. O vínculo com a identidade do provedor usa o ID confirmado. Os cookies de teste não são aceitos.

## Sessões e defesa

Cookie `__Host-cyb-session`, Secure, HttpOnly, SameSite=Lax, sem Domain, duração absoluta de 8 horas. O D1 guarda somente o SHA-256 do identificador aleatório de 256 bits. O navegador não recebe chaves Supabase nem persiste tokens do provedor. Toda requisição protegida consulta estado e permissões atuais. Bloqueio e recuperação encerram sessões anteriores. Mutações exigem Origin igual ao do site. Login e recuperação têm limites atômicos por endereço e IP. Respostas de conta usam no-store. Eventos de convite, ativação, recuperação e bloqueio são auditados sem senhas ou tokens.

Os endpoints antigos de senha compartilhada respondem 410. Os links antigos do painel exigem a mesma tela `/login`, sem modo de teste. O logout altera a sessão somente por POST/DELETE com validação de origem.

## Publicação e validação controlada

1. Aplicar a migração 0007 em preview; a hospedagem aplica a migração de produção ao publicar.
2. Executar os testes de autenticação, os testes existentes e o build.
3. Publicar a tela com `AUTH_EMAIL_ENABLED=false`, preservando o administrador nativo. Essa opção pausa os envios pela aplicação, mas permite ativar e testar o convite administrativo controlado.
4. Enviar pelo Supabase somente o convite de teste autorizado. Receber o e-mail, confirmar e definir a senha no site já atualizado. Confirmar que o link não pode ser reutilizado.
5. Testar login, nome no topo, logout e bloqueio de sessão aberta.
6. Confirmar acesso aos benefícios nas datas corretas e bloqueio de APIs administrativas para hóspedes.
7. Após confirmar a entrega externa, configurar `AUTH_EMAIL_ENABLED=true`, republicar a mesma versão e testar recuperação de senha.

Não enviar convites a hóspedes reais antes da validação controlada. Não reutilizar credenciais de teste como autenticação de produção.

Referências: https://supabase.com/docs/guides/auth/auth-email-templates e https://supabase.com/docs/guides/auth/passwords.

## Navegação e conteúdo

Login e ativação de senha levam à página inicial, independentemente do perfil ou do parâmetro de retorno. O gerador em `/guia/montar` exige conta aprovada no servidor. A página `/parceiros` exige login, mas não exige reserva vigente para mostrar o aviso de futuras parcerias; não exibe descontos ou dados de parceiros nesta etapa.

A verificação de segurança do Supabase sinaliza a proteção contra senhas vazadas como desativada. A regra de comprimento e composição é validada no servidor do site; esse recurso adicional do provedor tem configuração e disponibilidade próprias: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.
