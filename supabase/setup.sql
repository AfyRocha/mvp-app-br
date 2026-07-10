-- ============================================================
-- tem brasileiro — SETUP COMPLETO (schema + seed) em um arquivo.
-- Cole tudo isto no Supabase (SQL Editor > New query) e clique em Run.
-- Roda schema, RLS, Storage e os dados de exemplo de uma vez.
-- ============================================================

-- ============================================================
-- tem brasileiro — schema do MVP
-- Rode este arquivo no SQL Editor do Supabase (ou via supabase db push).
-- ============================================================

-- ------------------------------------------------------------
-- Tabelas
-- ------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  icone text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  tipo text not null default 'cliente' check (tipo in ('cliente', 'prestador')),
  telefone text,
  cidade text,
  endereco text,
  foto_url text,
  criado_em timestamptz not null default now()
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  nome_negocio text not null,
  categoria text not null references public.categories (slug),
  bio text,
  cidade_principal text not null,
  cidades_atendidas text[] not null default '{}',
  whatsapp text not null,
  servicos text[] not null default '{}',
  -- cor do avatar (hex), como no protótipo
  cor text,
  verificado boolean not null default false,
  plano text not null default 'free' check (plano in ('free', 'destaque')),
  desde int,
  aprovado boolean not null default false,
  visualizacoes int not null default 0,
  criado_em timestamptz not null default now()
);

create index providers_categoria_idx on public.providers (categoria);
create index providers_aprovado_idx on public.providers (aprovado);

create table public.provider_photos (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  url text not null,
  ordem int not null default 0
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  autor_profile_id uuid not null references public.profiles (id) on delete cascade,
  nota int not null check (nota between 1 and 5),
  texto text,
  criado_em timestamptz not null default now(),
  -- 1 avaliação por cliente por prestador
  unique (provider_id, autor_profile_id)
);

-- ------------------------------------------------------------
-- Perfil automático ao criar usuário no Auth
-- ------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- View da listagem: prestadores + nota média + total de avaliações
-- security_invoker => a RLS de providers vale também para a view
-- ------------------------------------------------------------

create view public.providers_com_nota
with (security_invoker = true) as
select
  p.*,
  c.nome as categoria_nome,
  round(avg(r.nota)::numeric, 1) as nota_media,
  count(r.id) as total_avaliacoes
from public.providers p
join public.categories c on c.slug = p.categoria
left join public.reviews r on r.provider_id = p.id
group by p.id, c.nome;

-- Reviews com o nome do autor, sem expor o restante do perfil.
-- View "security definer" (padrão): lê profiles ignorando RLS,
-- mas projeta apenas o nome.
create view public.reviews_com_autor as
select r.*, pr.nome as autor_nome
from public.reviews r
left join public.profiles pr on pr.id = r.autor_profile_id;

-- ------------------------------------------------------------
-- Contador de visualizações do perfil (RPC pública, sem expor UPDATE)
-- ------------------------------------------------------------

create function public.incrementar_visualizacao(p_provider_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.providers
  set visualizacoes = visualizacoes + 1
  where id = p_provider_id and aprovado = true;
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.provider_photos enable row level security;
alter table public.reviews enable row level security;

-- categories: leitura pública
create policy "categorias são públicas"
  on public.categories for select using (true);

-- profiles: cada um vê e edita só o próprio
create policy "ver o próprio perfil"
  on public.profiles for select using (auth.uid() = id);
create policy "criar o próprio perfil"
  on public.profiles for insert with check (auth.uid() = id);
create policy "editar o próprio perfil"
  on public.profiles for update using (auth.uid() = id);

-- providers: público vê aprovados; dono vê e edita o seu
create policy "prestadores aprovados são públicos"
  on public.providers for select using (aprovado = true or auth.uid() = profile_id);
create policy "cadastrar-se como prestador"
  on public.providers for insert with check (auth.uid() = profile_id);
create policy "editar o próprio anúncio"
  on public.providers for update using (auth.uid() = profile_id);

-- provider_photos: seguem o prestador
create policy "fotos de prestadores aprovados são públicas"
  on public.provider_photos for select using (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and (p.aprovado = true or p.profile_id = auth.uid())
    )
  );
create policy "dono gerencia as próprias fotos"
  on public.provider_photos for insert with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and p.profile_id = auth.uid()
    )
  );
create policy "dono remove as próprias fotos"
  on public.provider_photos for delete using (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and p.profile_id = auth.uid()
    )
  );

-- reviews: leitura pública; escrever exige login e é 1 por prestador (unique)
create policy "avaliações são públicas"
  on public.reviews for select using (true);
create policy "avaliar exige login"
  on public.reviews for insert to authenticated with check (auth.uid() = autor_profile_id);
create policy "editar a própria avaliação"
  on public.reviews for update using (auth.uid() = autor_profile_id);
create policy "remover a própria avaliação"
  on public.reviews for delete using (auth.uid() = autor_profile_id);

-- ------------------------------------------------------------
-- Grants (privilégios de tabela)
-- SEM ISTO a RLS nem chega a ser avaliada: o PostgREST devolve
-- "permission denied for table ...". As policies acima só filtram
-- LINHAS; o acesso à tabela em si depende destes GRANTs.
-- ------------------------------------------------------------

grant usage on schema public to anon, authenticated;

-- Leitura (RLS filtra as linhas): categorias, prestadores, fotos,
-- avaliações e as duas views usadas pelo app.
grant select on public.categories        to anon, authenticated;
grant select on public.providers          to anon, authenticated;
grant select on public.provider_photos    to anon, authenticated;
grant select on public.reviews            to anon, authenticated;
grant select on public.providers_com_nota to anon, authenticated;
grant select on public.reviews_com_autor  to anon, authenticated;

-- Escrita: apenas usuários logados (a RLS restringe ao dono). O UPDATE de
-- providers/reviews é POR COLUNA: aprovado/verificado/plano/visualizacoes ficam
-- fora do alcance do cliente (só admin/service_role; o contador de views usa a
-- função security definer).
grant select, insert, update on public.profiles to authenticated;
grant insert, delete on public.providers to authenticated;
grant update (nome_negocio, categoria, bio, cidade_principal, cidades_atendidas,
              whatsapp, servicos, cor, desde) on public.providers to authenticated;
grant insert, delete on public.provider_photos to authenticated;
grant insert, delete on public.reviews to authenticated;
grant update (nota, texto) on public.reviews to authenticated;

-- RPC pública de contagem de visualizações.
grant execute on function public.incrementar_visualizacao(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- Storage: fotos de perfil e portfólio
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('provider-photos', 'provider-photos', true)
on conflict (id) do nothing;

create policy "leitura pública das fotos"
  on storage.objects for select using (bucket_id = 'provider-photos');

-- cada usuário escreve apenas na própria pasta ({uid}/arquivo.jpg)
create policy "upload na própria pasta"
  on storage.objects for insert to authenticated with check (
    bucket_id = 'provider-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "remover da própria pasta"
  on storage.objects for delete to authenticated using (
    bucket_id = 'provider-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- tem brasileiro — seed do MVP (dados do protótipo aprovado)
-- Rode DEPOIS de 0001_schema.sql.
-- 8 categorias + 5 prestadores do protótipo (já aprovados) +
-- usuários demo como autores dos depoimentos.
-- ============================================================

-- ------------------------------------------------------------
-- Categorias (nomes e ícones lucide do protótipo)
-- ------------------------------------------------------------

insert into public.categories (slug, nome, icone) values
  ('limpeza',    'Limpeza',               'sparkles'),
  ('reforma',    'Reforma & Handyman',    'hammer'),
  ('taxes',      'Taxes & Contabilidade', 'calculator'),
  ('beleza',     'Beleza',                'scissors'),
  ('foto',       'Fotografia',            'camera'),
  ('comida',     'Comida & Eventos',      'utensils-crossed'),
  ('transporte', 'Transporte',            'truck'),
  ('imigracao',  'Imigração',             'file-check-2');

-- ------------------------------------------------------------
-- Usuários demo (não conseguem logar — sem senha válida).
-- São os autores dos depoimentos do protótipo.
-- O trigger on_auth_user_created cria os profiles.
-- ------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
   'authenticated', 'authenticated', 'demo.fernanda@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Fernanda R."}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
   'authenticated', 'authenticated', 'demo.carlos@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Carlos M."}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333',
   'authenticated', 'authenticated', 'demo.paulo@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Paulo A."}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-8444-444444444444',
   'authenticated', 'authenticated', 'demo.bruna@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Bruna L."}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-4555-8555-555555555555',
   'authenticated', 'authenticated', 'demo.camilajoao@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Camila e João"}',
   now(), now(), '', '');

-- ------------------------------------------------------------
-- Prestadores do protótipo (aprovados; sem dono — profile_id null)
-- ------------------------------------------------------------

insert into public.providers (
  id, nome_negocio, categoria, bio, cidade_principal, cidades_atendidas,
  whatsapp, servicos, cor, verificado, plano, desde, aprovado
) values
  ('aaaaaaa1-0000-4000-8000-000000000001',
   'Márcia Oliveira', 'limpeza',
   'Limpeza residencial e comercial. Deep cleaning, move-in/move-out. Equipe própria, produtos inclusos.',
   'Orlando, FL', array['Orlando', 'Kissimmee', 'Winter Garden'],
   '14075550101',
   array['Limpeza residencial', 'Deep cleaning', 'Move-out cleaning', 'Escritórios'],
   '#2E7D5B', true, 'destaque', 2019, true),

  ('aaaaaaa1-0000-4000-8000-000000000002',
   'Rafael Santos', 'reforma',
   'Handyman licenciado. Pintura, drywall, pisos, montagem de móveis e pequenos reparos em geral.',
   'Orlando, FL', array['Orlando', 'Lake Nona', 'Sanford'],
   '14075550102',
   array['Pintura', 'Drywall', 'Instalação de pisos', 'Montagem de móveis'],
   '#8A5A2B', true, 'free', 2017, true),

  ('aaaaaaa1-0000-4000-8000-000000000003',
   'Juliana Costa, CPA', 'taxes',
   'Contadora com CPA. Tax return pessoa física e empresa, abertura de LLC, ITIN e planejamento fiscal.',
   'Boston, MA', array['Atende todos os EUA (online)'],
   '16175550103',
   array['Tax return', 'Abertura de LLC', 'ITIN', 'Bookkeeping'],
   '#3D4E8A', true, 'free', 2015, true),

  ('aaaaaaa1-0000-4000-8000-000000000004',
   'Aline Ferreira', 'beleza',
   'Cabeleireira especializada em progressiva, mechas e corte. Atendimento em salão ou domicílio.',
   'Danbury, CT', array['Danbury', 'Bethel', 'Newtown'],
   '12035550104',
   array['Progressiva', 'Mechas & luzes', 'Corte feminino', 'Atendimento a domicílio'],
   '#9C3D62', false, 'free', 2021, true),

  ('aaaaaaa1-0000-4000-8000-000000000005',
   'Diego Almeida', 'foto',
   'Fotógrafo de família e eventos. Ensaios na Disney, casamentos, aniversários e fotos profissionais.',
   'Orlando, FL', array['Orlando', 'Disney', 'Miami (sob consulta)'],
   '14075550105',
   array['Ensaio na Disney', 'Casamentos', 'Eventos', 'Retrato profissional'],
   '#54428A', true, 'free', 2020, true);

-- ------------------------------------------------------------
-- Avaliações (depoimentos do protótipo + variações)
-- ------------------------------------------------------------

insert into public.reviews (provider_id, autor_profile_id, nota, texto) values
  -- Márcia Oliveira
  ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 5,
   'Contratei pra limpeza de mudança e ficou impecável. Super pontual e caprichosa!'),
  ('aaaaaaa1-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 5,
   'Equipe de confiança, contrato toda semana. Recomendo demais.'),
  ('aaaaaaa1-0000-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444', 4,
   'Ótimo serviço, só atrasou um pouquinho na primeira visita.'),

  -- Rafael Santos
  ('aaaaaaa1-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 5,
   'Fez a pintura da casa toda em 3 dias, orçamento justo e trabalho de primeira.'),
  ('aaaaaaa1-0000-4000-8000-000000000002', '55555555-5555-4555-8555-555555555555', 4,
   'Montou os móveis rapidinho e ainda consertou uma porta. Muito prestativo.'),

  -- Juliana Costa
  ('aaaaaaa1-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 5,
   'Ela resolveu meu ITIN e meus taxes atrasados sem dor de cabeça. Explica tudo em português!'),
  ('aaaaaaa1-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 5,
   'Abriu minha LLC em poucos dias. Atendimento impecável.'),

  -- Aline Ferreira
  ('aaaaaaa1-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 5,
   'Melhor progressiva que já fiz aqui nos EUA, do jeitinho do Brasil.'),

  -- Diego Almeida
  ('aaaaaaa1-0000-4000-8000-000000000005', '55555555-5555-4555-8555-555555555555', 5,
   'As fotos do nosso ensaio na Disney ficaram um sonho. Ele dirige super bem as poses!'),
  ('aaaaaaa1-0000-4000-8000-000000000005', '33333333-3333-4333-8333-333333333333', 4,
   'Fotos lindas e entrega rápida. Valeu cada centavo.');
