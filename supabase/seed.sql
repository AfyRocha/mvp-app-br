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
