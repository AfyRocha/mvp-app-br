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

const supabase = createClient(url, anon, { auth: { persistSession: false } });
let pass = 0;
let fail = 0;
const ok = (m) => { pass++; console.log(`  ✅ ${m}`); };
const bad = (m) => { fail++; console.log(`  ❌ ${m}`); };

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
    // valida a ordenação
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

// 4) View de avaliações com nome do autor
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

// 5) Signup + 3) RLS de não-aprovados (combinados)
console.log('\n[4] Signup + [5] RLS de prestador não-aprovado');
{
  const email = `verify+${Date.now()}@tembrasileiro.app`;
  const password = `Verify!${Math.random().toString(36).slice(2, 10)}`;
  const { data: signUp, error: suErr } = await supabase.auth.signUp({
    email, password, options: { data: { nome: 'Teste Verificação' } },
  });
  if (suErr) { bad(`signup falhou: ${suErr.message}`); }
  else {
    ok(`signup OK (user ${signUp.user?.id?.slice(0, 8)}…)`);
    const hasSession = Boolean(signUp.session);
    console.log(`     ${hasSession ? 'sessão ativa (confirmação de e-mail desligada)' : 'sem sessão (aguarda confirmação de e-mail)'}`);

    if (hasSession && signUp.user) {
      // insere um prestador NÃO aprovado como esse usuário
      const { data: prov, error: insErr } = await supabase
        .from('providers').insert({
          profile_id: signUp.user.id,
          nome_negocio: 'Prestador Teste (não aprovado)',
          categoria: 'limpeza',
          cidade_principal: 'Orlando, FL',
          whatsapp: '10000000000',
          aprovado: false,
        }).select('id').single();
      if (insErr) { bad(`insert do prestador falhou: ${insErr.message}`); }
      else {
        ok('prestador não-aprovado criado pelo dono');
        // o dono ainda vê o próprio (RLS: aprovado OR dono)
        const { data: mine } = await supabase.from('providers').select('id').eq('id', prov.id);
        mine?.length ? ok('dono enxerga o próprio anúncio pendente') : bad('dono não vê o próprio anúncio');
        // logout -> anônimo NÃO pode ver o não-aprovado
        await supabase.auth.signOut();
        const anonCli = createClient(url, anon, { auth: { persistSession: false } });
        const { data: seen } = await anonCli.from('providers_com_nota').select('id').eq('id', prov.id);
        seen && seen.length === 0
          ? ok('RLS OK: anônimo NÃO vê o prestador não-aprovado')
          : bad('RLS FALHOU: não-aprovado vazou para o anônimo');
        const { data: seenBase } = await anonCli.from('providers').select('id').eq('id', prov.id);
        seenBase && seenBase.length === 0
          ? ok('RLS OK: anônimo NÃO vê na tabela base providers')
          : bad('RLS FALHOU: não-aprovado visível na tabela base');
      }
    } else {
      console.log('     (RLS de não-aprovado exige sessão para inserir; pulei o insert. Testo o inverso abaixo.)');
      // Sem sessão: garante que a contagem pública == aprovados do seed
      const { count } = await supabase
        .from('providers_com_nota').select('id', { count: 'exact', head: true });
      count === 5 ? ok('anônimo vê apenas os 5 aprovados (nenhum pendente vaza)') : bad(`anônimo vê ${count} prestadores`);
    }
  }
}

console.log(`\n─── Resultado: ${pass} OK, ${fail} falha(s) ───`);
process.exit(fail ? 1 : 0);
