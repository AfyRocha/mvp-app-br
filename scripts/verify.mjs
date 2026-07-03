// Verificação completa do "tem brasileiro" contra o Supabase.
// Espelha as queries reais do app (src/lib/queries.ts).
// Uso: EXPO_PUBLIC_SUPABASE_URL=... EXPO_PUBLIC_SUPABASE_ANON_KEY=... node scripts/verify.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Faltam EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const CANARY_ID = '99999999-9999-4999-8999-999999999999'; // prestador não-aprovado (fix_grants.sql)
const supabase = createClient(url, anon, { auth: { persistSession: false } });
let pass = 0;
let fail = 0;
let warn = 0;
const ok = (m) => { pass++; console.log(`  ✅ ${m}`); };
const bad = (m) => { fail++; console.log(`  ❌ ${m}`); };
const note = (m) => { warn++; console.log(`  ⚠️  ${m}`); };

// 1) Prestadores: 5, ordenados Destaque -> melhor nota (igual fetchProviders)
console.log('\n[1] Prestadores (5, ordenados Destaque → nota)');
{
  const { data, error } = await supabase
    .from('providers_com_nota').select('*').eq('aprovado', true).limit(200);
  if (error) { bad(`erro na view: ${error.message}`); }
  else {
    const rows = data.sort((a, b) => {
      if (a.plano !== b.plano) return a.plano === 'destaque' ? -1 : 1;
      return (b.nota_media ?? 0) - (a.nota_media ?? 0);
    });
    rows.length === 5 ? ok(`5 prestadores aprovados`) : bad(`esperado 5, veio ${rows.length}`);
    rows.forEach((r, i) =>
      console.log(`     ${i + 1}. ${r.nome_negocio} — ${r.plano} — nota ${r.nota_media ?? '—'} (${r.total_avaliacoes} aval.)`));
    let ordered = true;
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], b = rows[i];
      const rank = (p) => (p.plano === 'destaque' ? 0 : 1);
      if (rank(a) > rank(b)) ordered = false;
      if (rank(a) === rank(b) && (a.nota_media ?? 0) < (b.nota_media ?? 0)) ordered = false;
    }
    ordered ? ok('ordenação Destaque→nota correta') : bad('ordenação incorreta');
    rows[0]?.plano === 'destaque'
      ? ok(`1º é o plano destaque (${rows[0].nome_negocio})`)
      : bad('o 1º não é destaque');
  }
}

// 2) Categorias: 8
console.log('\n[2] Categorias (8)');
{
  const { data, error } = await supabase.from('categories').select('*').order('nome');
  if (error) bad(`erro: ${error.message}`);
  else {
    data.length === 8 ? ok(`8 categorias`) : bad(`esperado 8, veio ${data.length}`);
    console.log('     ' + data.map((c) => c.nome).join(', '));
  }
}

// 3) View de avaliações com nome do autor
console.log('\n[3] View reviews_com_autor (nome do autor)');
{
  const provId = 'aaaaaaa1-0000-4000-8000-000000000001'; // Márcia
  const { data, error } = await supabase
    .from('reviews_com_autor').select('*').eq('provider_id', provId)
    .order('criado_em', { ascending: false });
  if (error) bad(`erro: ${error.message}`);
  else if (!data.length) bad('nenhuma avaliação retornada');
  else {
    const comNome = data.filter((r) => r.autor_nome);
    comNome.length === data.length
      ? ok(`${data.length} avaliações, todas com autor_nome`)
      : bad(`${data.length - comNome.length} sem autor_nome`);
    console.log('     ex.: ' + data.slice(0, 2).map((r) => `${r.autor_nome} (${r.nota}★)`).join(' | '));
  }
}

// 4) RLS de prestador NÃO aprovado (via canário do fix_grants.sql)
console.log('\n[4] RLS: prestador não-aprovado é invisível ao anônimo');
{
  const { data, error } = await supabase
    .from('providers_com_nota').select('id').eq('id', CANARY_ID);
  if (error) { bad(`erro ao consultar a view: ${error.message}`); }
  else if (data.length === 0) {
    ok('canário não-aprovado NÃO aparece na listagem pública (RLS OK)');
    const { data: base } = await supabase.from('providers').select('id').eq('id', CANARY_ID);
    base && base.length === 0
      ? ok('canário também invisível na tabela base providers (RLS OK)')
      : bad('canário visível na tabela base providers (RLS FALHOU)');
  } else {
    bad('RLS FALHOU: o prestador não-aprovado vazou para o anônimo');
  }
  // Prova extra: anônimo não consegue inserir prestador (write bloqueado)
  const { error: insErr } = await supabase
    .from('providers').insert({ nome_negocio: 'x', categoria: 'limpeza', cidade_principal: 'x', whatsapp: '0' });
  insErr ? ok(`anônimo NÃO consegue inserir prestador (${insErr.code || 'bloqueado'})`)
         : bad('anônimo conseguiu inserir prestador (RLS/grant FALHOU)');
}

// 5) Signup real
console.log('\n[5] Signup');
{
  const email = `tembr.verify.${Date.now()}@gmail.com`;
  const password = `Verify!${Math.random().toString(36).slice(2, 10)}`;
  const { data: signUp, error: suErr } = await supabase.auth.signUp({
    email, password, options: { data: { nome: 'Teste Verificação' } },
  });
  if (suErr) {
    if (suErr.code === 'over_email_send_rate_limit' || suErr.status === 429) {
      note(`endpoint de signup OK, mas rate limit de e-mail atingido (${suErr.message})`);
    } else {
      bad(`signup falhou: ${suErr.message}`);
    }
  } else if (signUp.user) {
    ok(`signup OK (user ${signUp.user.id.slice(0, 8)}…, email ${signUp.user.email})`);
    console.log(`     ${signUp.session
      ? 'sessão ativa (confirmação de e-mail desligada)'
      : 'sem sessão → confirmação de e-mail LIGADA (esperado)'}`);
  } else {
    bad('signup não retornou usuário');
  }
}

console.log(`\n─── Resultado: ${pass} OK, ${fail} falha(s), ${warn} aviso(s) ───`);
process.exit(fail ? 1 : 0);
