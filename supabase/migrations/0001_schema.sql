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
-- Selo "Verificado" automático: fica true quando o cadastro do anúncio
-- está completo (todos os campos principais preenchidos). Calculado por
-- trigger no servidor => o cliente não consegue forçar o selo.
-- ------------------------------------------------------------

create function public.calcular_verificado()
returns trigger
language plpgsql
as $$
begin
  new.verificado := (
    coalesce(length(trim(new.nome_negocio)), 0) > 0
    and new.categoria is not null
    and coalesce(length(trim(new.cidade_principal)), 0) > 0
    and coalesce(array_length(new.cidades_atendidas, 1), 0) > 0
    and coalesce(length(trim(new.whatsapp)), 0) > 0
    and coalesce(length(trim(new.bio)), 0) > 0
  );
  return new;
end;
$$;

create trigger providers_calcular_verificado
  before insert or update on public.providers
  for each row execute function public.calcular_verificado();

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
create policy "remover o próprio anúncio"
  on public.providers for delete using (auth.uid() = profile_id);

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
grant insert, update, delete on public.reviews to authenticated;

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
