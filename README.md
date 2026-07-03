# tem brasileiro

Diretório mobile de prestadores de serviços brasileiros nos EUA. Clientes buscam por categoria e cidade e chamam direto no WhatsApp. MVP sem pagamentos — monetização futura via plano **Destaque** para prestadores.

**Stack:** Expo (React Native + TypeScript) · Expo Router · Supabase (Postgres, Auth, Storage) · expo-blur (glassmorphism) · lucide (ícones).

## 1. Configurar o Supabase

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de:
   1. `supabase/migrations/0001_schema.sql` (tabelas, RLS, **grants**, views, Storage)
   2. `supabase/seed.sql` (8 categorias + 5 prestadores de exemplo com avaliações)

   > Também dá para rodar `supabase/setup.sql` (schema + seed combinados) de uma vez.
   > **Já tem um projeto antigo dando `permission denied for table ...`?** Rode
   > `supabase/fix_grants.sql` — ele só aplica os `GRANT`s que faltavam (idempotente).
3. Deixe a confirmação de e-mail **ligada** (padrão do Supabase, em
   **Authentication → Sign In / Up → Email → Confirm email**). O app já trata esse
   fluxo — veja [Confirmação de e-mail no cadastro](#confirmação-de-e-mail-no-cadastro).

## 2. Rodar o app

```bash
cp .env.example .env   # preencha com a URL e a anon key do projeto
                       # (Dashboard → Project Settings → API)
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)). Se o celular não estiver na mesma rede, use `npx expo start --tunnel`.

## 2b. Deploy web na Vercel

O app roda como **SPA web** (`web.output: "single"` no `app.json`) e o `vercel.json`
já define build/output. Para publicar:

1. Na [Vercel](https://vercel.com/new), **importe o repositório** (Framework preset: *Other* —
   o `vercel.json` cuida do resto: `npx expo export --platform web` → `dist/`).
2. Em **Settings → Environment Variables**, adicione (Production **e** Preview):
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

   > São inlinadas no build (prefixo `EXPO_PUBLIC_`); sem elas o app sobe sem backend.
3. **Deploy**. Cada push na branch gera um preview; a branch de produção publica no domínio.
4. No **Supabase → Authentication → URL Configuration**, adicione a URL da Vercel em
   *Site URL* e *Redirect URLs* — assim o link de confirmação de e-mail volta para o app.

Build local (para conferir antes de publicar):

```bash
npx expo export --platform web      # gera dist/
npx serve dist                      # ou: python3 -m http.server -d dist 8080
```

> A versão web é ótima para um link de feedback compartilhável. Para validar a
> experiência **mobile** de verdade (blur/glass, seletor de fotos, haptics), use o Expo Go.

## 3. Aprovar prestadores (manual, sem painel admin)

Novos cadastros entram com `aprovado = false` e não aparecem na busca. Para aprovar, rode no SQL Editor:

```sql
-- listar pendentes
select id, nome_negocio, cidade_principal, whatsapp
from providers where aprovado = false;

-- aprovar
update providers set aprovado = true where id = 'ID_AQUI';
```

Extras administrativos:

```sql
-- dar o selo Verificado (amarelo)
update providers set verificado = true where id = 'ID_AQUI';

-- ativar o plano Destaque (topo da busca)
update providers set plano = 'destaque' where id = 'ID_AQUI';
```

## Confirmação de e-mail no cadastro

A confirmação de e-mail fica **ligada**: ao criar a conta, o Supabase envia um link
e **não** abre sessão até o usuário confirmar. O app já foi construído para isso:

1. **Cadastro** — se o `signUp` volta sem sessão, a tela mostra
   *"Confirme seu e-mail… Depois de confirmar, volte e entre."* (`src/app/auth/login.tsx`).
2. **Confirmação** — o usuário clica no link recebido por e-mail.
3. **Login** — tentar entrar antes de confirmar retorna `email_not_confirmed`, que o app
   traduz para *"Confirme seu e-mail antes de entrar."*. Após confirmar, o login abre a
   sessão normalmente.

Notas de operação:
- O e-mail transacional padrão do Supabase tem **limite de envios por hora**
  (`over_email_send_rate_limit`); para produção, configure um SMTP próprio em
  **Authentication → Emails**.
- O Supabase rejeita alguns domínios no cadastro (ex.: `@tembrasileiro.app` volta como
  *invalid*); use um e-mail real.

### Verificação do backend

O script `scripts/verify.mjs` confere, contra o Supabase configurado no `.env`, os
5 pontos do MVP: 5 prestadores ordenados (Destaque→nota), 8 categorias, view de
avaliações com o nome do autor, RLS escondendo prestadores não-aprovados e o signup.

```bash
node scripts/verify.mjs   # lê EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY do ambiente
```

## Regras de produto no MVP

- Busca e perfis são públicos; **avaliar** e **anunciar** exigem login (e-mail/senha).
- Ordenação da lista: plano `destaque` primeiro, depois nota média.
- 1 avaliação por cliente por prestador (reenviar substitui a anterior).
- Visualizações do perfil são contadas a cada abertura e exibidas ao prestador na aba Perfil.
- Botão do WhatsApp abre `wa.me` com a mensagem "Olá! Te encontrei no tem brasileiro 👋".

## Estrutura

```
src/app/            telas (Expo Router): (tabs)/, provider/[id], auth/login
src/components/     UI do design system (vidro, chips, cards, tab bar…)
src/lib/            client Supabase, auth context, queries, tipos
src/theme.ts        tokens do protótipo (cores, fontes, raios, sombras)
supabase/           migration + seed (setup.sql = combinado; fix_grants.sql = grants)
scripts/verify.mjs  verificação do backend (5 checks do MVP)
```

A referência visual é o protótipo aprovado `tem-brasileiro-app.jsx` (glassmorphism, Bricolage Grotesque + Inter, verde `#14634B` / amarelo `#FFC942`).
