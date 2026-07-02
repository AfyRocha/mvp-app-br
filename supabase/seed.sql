-- ============================================================
-- tem brasileiro — seed do MVP
-- Rode DEPOIS de 0001_schema.sql.
-- 8 categorias + 5 prestadores fictícios (já aprovados) +
-- 3 usuários demo para dar vida às avaliações.
-- ============================================================

-- ------------------------------------------------------------
-- Categorias
-- ------------------------------------------------------------

insert into public.categories (slug, nome, icone) values
  ('limpeza',    'Limpeza',    'sparkles'),
  ('reforma',    'Reforma',    'hammer'),
  ('taxes',      'Taxes',      'calculator'),
  ('beleza',     'Beleza',     'scissors'),
  ('foto',       'Foto',       'camera'),
  ('comida',     'Comida',     'utensils'),
  ('transporte', 'Transporte', 'car'),
  ('imigracao',  'Imigração',  'stamp');

-- ------------------------------------------------------------
-- Usuários demo (não conseguem logar — sem senha válida).
-- Servem apenas de autores das avaliações do seed.
-- O trigger on_auth_user_created cria os profiles.
-- ------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
   'authenticated', 'authenticated', 'demo.mariana@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Mariana Souza"}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
   'authenticated', 'authenticated', 'demo.rafael@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Rafael Lima"}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333',
   'authenticated', 'authenticated', 'demo.camila@tembrasileiro.app', '',
   now(), '{"provider":"email","providers":["email"]}', '{"nome":"Camila Ferreira"}',
   now(), now(), '', '');

-- ------------------------------------------------------------
-- Prestadores fictícios (aprovados; sem dono — profile_id null)
-- ------------------------------------------------------------

insert into public.providers (
  id, nome_negocio, categoria, bio, cidade_principal, cidades_atendidas,
  whatsapp, verificado, plano, desde, aprovado
) values
  ('aaaaaaa1-0000-4000-8000-000000000001',
   'Ana Clean Services', 'limpeza',
   'Limpeza residencial e comercial com produtos próprios. Equipe brasileira, pontual e de confiança. Orçamento grátis pelo WhatsApp.',
   'Boston, MA', array['Boston, MA', 'Somerville, MA', 'Cambridge, MA'],
   '16175550101', true, 'destaque', 2018, true),

  ('aaaaaaa1-0000-4000-8000-000000000002',
   'Silva Renovations', 'reforma',
   'Reformas em geral: pintura, drywall, deck, banheiro e cozinha. Licenciado e com seguro. Fotos de obras no perfil.',
   'Framingham, MA', array['Framingham, MA', 'Natick, MA', 'Marlborough, MA'],
   '15085550102', true, 'free', 2015, true),

  ('aaaaaaa1-0000-4000-8000-000000000003',
   'Taxes com a Paty', 'taxes',
   'Declaração de imposto de renda americano para brasileiros, ITIN e abertura de LLC. Atendimento em português, 100% online.',
   'Orlando, FL', array['Orlando, FL', 'Kissimmee, FL', 'Atendimento online'],
   '14075550103', true, 'free', 2020, true),

  ('aaaaaaa1-0000-4000-8000-000000000004',
   'Studio Bela', 'beleza',
   'Salão brasileiro: progressiva, mechas, manicure e design de sobrancelhas. Agende seu horário pelo WhatsApp.',
   'Newark, NJ', array['Newark, NJ', 'Harrison, NJ', 'Kearny, NJ'],
   '19735550104', false, 'free', 2021, true),

  ('aaaaaaa1-0000-4000-8000-000000000005',
   'Foto da Lu', 'foto',
   'Ensaios de família, gestante, aniversário e casamentos. Pacotes a partir de $150 com fotos editadas em alta resolução.',
   'Miami, FL', array['Miami, FL', 'Fort Lauderdale, FL', 'Pompano Beach, FL'],
   '13055550105', false, 'free', 2019, true);

-- ------------------------------------------------------------
-- Avaliações demo
-- ------------------------------------------------------------

insert into public.reviews (provider_id, autor_profile_id, nota, texto) values
  ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 5,
   'Impecável! Deixaram meu apartamento brilhando e foram super pontuais.'),
  ('aaaaaaa1-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 5,
   'Contrato toda semana. Equipe de confiança, recomendo demais.'),
  ('aaaaaaa1-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 4,
   'Ótimo serviço, só atrasaram um pouquinho na primeira visita.'),

  ('aaaaaaa1-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 5,
   'Reformaram meu banheiro em uma semana. Acabamento excelente.'),
  ('aaaaaaa1-0000-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', 5,
   'Preço justo e trabalho de primeira. Já indiquei para a família toda.'),

  ('aaaaaaa1-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 5,
   'A Paty resolveu meu ITIN rapidinho e ainda me explicou tudo em português.'),
  ('aaaaaaa1-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 4,
   'Declaração feita sem dor de cabeça. Atendimento muito atencioso.'),

  ('aaaaaaa1-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 5,
   'Melhor progressiva da região! Saí de lá me sentindo outra pessoa.'),

  ('aaaaaaa1-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', 5,
   'Fotos lindas do aniversário da minha filha. Entrega super rápida.');
