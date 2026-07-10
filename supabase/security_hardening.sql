-- ============================================================
-- ACHEI — endurecimento de segurança (RLS + grants por coluna)
-- Cole no Supabase → SQL Editor → New query → Run. Idempotente.
--
-- Problema: authenticated tinha UPDATE na tabela inteira de providers/reviews,
-- e as policies não restringem colunas. Um usuário logado poderia, por chamada
-- direta à API, se auto-aprovar, se auto-verificar, virar 'destaque' e forjar
-- visualizações. Aqui trocamos por GRANT de UPDATE apenas nas colunas seguras.
-- aprovado/verificado/plano ficam só para o admin (service_role/SQL Editor);
-- visualizacoes continua sendo atualizada pela função security definer.
-- ============================================================

-- providers: authenticated só pode dar UPDATE nas colunas do próprio anúncio.
-- aprovado, verificado, plano e visualizacoes ficam de fora (só admin; o
-- contador de views é atualizado pela função security definer).
revoke update on public.providers from authenticated;
grant update (nome_negocio, categoria, bio, cidade_principal, cidades_atendidas,
              whatsapp, servicos, cor, desde) on public.providers to authenticated;
