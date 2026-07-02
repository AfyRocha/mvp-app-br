# tem brasileiro

Diretório mobile de prestadores de serviços brasileiros nos EUA. Clientes buscam por categoria e cidade e chamam direto no WhatsApp. MVP sem pagamentos — monetização futura via plano **Destaque** para prestadores.

**Stack:** Expo (React Native + TypeScript) · Expo Router · Supabase (Postgres, Auth, Storage) · expo-blur (glassmorphism) · lucide (ícones).

## 1. Configurar o Supabase

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de:
   1. `supabase/migrations/0001_schema.sql` (tabelas, RLS, views, Storage)
   2. `supabase/seed.sql` (8 categorias + 5 prestadores de exemplo com avaliações)
3. (Recomendado para o MVP) Em **Authentication → Sign In / Up → Email**, desative *Confirm email* para o cadastro entrar direto.

## 2. Rodar o app

```bash
cp .env.example .env   # preencha com a URL e a anon key do projeto
                       # (Dashboard → Project Settings → API)
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)). Se o celular não estiver na mesma rede, use `npx expo start --tunnel`.

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
supabase/           migration + seed
```

A referência visual é o protótipo aprovado `tem-brasileiro-app.jsx` (glassmorphism, Bricolage Grotesque + Inter, verde `#14634B` / amarelo `#FFC942`).
