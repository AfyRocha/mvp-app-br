-- ============================================================
-- ACHEI — aplicar TODAS as atualizações no projeto Supabase existente.
-- Cole no Supabase → SQL Editor → New query → Run.
-- Idempotente: pode rodar quantas vezes quiser. Substitui os scripts
-- add_perfil_cliente.sql e security_hardening.sql (roda tudo de uma vez).
-- ============================================================

-- 1) Campos do perfil do cliente (endereço e foto)
alter table public.profiles add column if not exists endereco text;
alter table public.profiles add column if not exists foto_url text;

-- 2) Segurança: UPDATE de providers só nas colunas do próprio anúncio.
--    aprovado/verificado/plano/visualizacoes ficam fora do alcance do cliente.
revoke update on public.providers from authenticated;
grant update (nome_negocio, categoria, bio, cidade_principal, cidades_atendidas,
              whatsapp, servicos, cor, desde) on public.providers to authenticated;

-- 3) Excluir a própria conta: permitir apagar o próprio anúncio
drop policy if exists "remover o próprio anúncio" on public.providers;
create policy "remover o próprio anúncio"
  on public.providers for delete using (auth.uid() = profile_id);
grant delete on public.providers to authenticated;

-- 4) Selo "Verificado" automático: true quando o cadastro do anúncio está
--    completo. Calculado por trigger no servidor (o cliente não força o selo).
create or replace function public.calcular_verificado()
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

drop trigger if exists providers_calcular_verificado on public.providers;
create trigger providers_calcular_verificado
  before insert or update on public.providers
  for each row execute function public.calcular_verificado();

-- recalcula o selo dos prestadores que já existem
update public.providers set nome_negocio = nome_negocio;
