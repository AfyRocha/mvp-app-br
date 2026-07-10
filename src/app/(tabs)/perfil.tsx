import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, Eye, LogOut, ShieldCheck, Trash2, UserRound } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { Avatar } from '@/components/avatar';
import { CategoryChip } from '@/components/category-chip';
import { GlassCard } from '@/components/glass';
import { VerifiedBadge } from '@/components/verified-badge';
import { useAuth } from '@/lib/auth';
import { confirmAction, notify } from '@/lib/feedback';
import { supabase } from '@/lib/supabase';
import {
  fetchCategories,
  fetchMyProvider,
  updateMyProfile,
  updateProvider,
  uploadProviderPhoto,
} from '@/lib/queries';
import type { Category, Provider } from '@/lib/types';
import { colors, fonts, glass, radius } from '@/theme';

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile, signOut, refreshProfile } = useAuth();

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [carregando, setCarregando] = useState(true);

  // --- Dados pessoais do cliente ---
  const [pNome, setPNome] = useState('');
  const [pTelefone, setPTelefone] = useState('');
  const [pEndereco, setPEndereco] = useState('');
  const [pFotoUrl, setPFotoUrl] = useState<string | null>(null);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [subindoFoto, setSubindoFoto] = useState(false);

  // --- Edição do anúncio (prestador) ---
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [cidade, setCidade] = useState('');
  const [cidadesAtendidas, setCidadesAtendidas] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    if (!session) return Promise.resolve();
    return Promise.all([fetchMyProvider(session.user.id), fetchCategories()])
      .then(([p, cats]) => {
        setCategorias(cats);
        setProvider(p);
        if (p) {
          setNome(p.nome_negocio);
          setCategoria(p.categoria);
          setCidade(p.cidade_principal);
          setCidadesAtendidas(p.cidades_atendidas.join(', '));
          setWhatsapp(p.whatsapp);
          setBio(p.bio ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [session]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Sincroniza os dados pessoais quando o perfil carrega
  useEffect(() => {
    if (profile) {
      setPNome(profile.nome ?? '');
      setPTelefone(profile.telefone ?? '');
      setPEndereco(profile.endereco ?? '');
      setPFotoUrl(profile.foto_url ?? null);
    }
  }, [profile]);

  async function salvarDados() {
    if (!session || salvandoDados) return;
    setSalvandoDados(true);
    try {
      await updateMyProfile(session.user.id, {
        nome: pNome.trim(),
        telefone: pTelefone.trim(),
        endereco: pEndereco.trim(),
      });
      await refreshProfile();
      notify('Meus dados', 'Dados atualizados!');
    } catch (e) {
      notify('Meus dados', e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function trocarFoto() {
    if (!session || subindoFoto) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (resultado.canceled) return;
    setSubindoFoto(true);
    try {
      const url = await uploadProviderPhoto(session.user.id, resultado.assets[0].uri, 0);
      await updateMyProfile(session.user.id, { foto_url: url });
      setPFotoUrl(url);
      await refreshProfile();
    } catch (e) {
      notify('Foto de perfil', e instanceof Error ? e.message : 'Não foi possível enviar a foto.');
    } finally {
      setSubindoFoto(false);
    }
  }

  async function salvarAnuncio() {
    if (!provider || salvando) return;
    setSalvando(true);
    try {
      await updateProvider(provider.id, {
        nome_negocio: nome.trim(),
        categoria: categoria ?? provider.categoria,
        cidade_principal: cidade.trim(),
        cidades_atendidas: cidadesAtendidas
          .split(/[,·;]/)
          .map((c) => c.trim())
          .filter(Boolean),
        whatsapp: whatsapp.replace(/\D/g, ''),
        bio: bio.trim(),
      });
      await carregar();
      notify('Meu anúncio', 'Anúncio atualizado!');
    } catch (e) {
      notify('Meu anúncio', e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    confirmAction({
      title: 'Excluir minha conta',
      message:
        'Isso remove seu anúncio, fotos, avaliações e dados pessoais, e desconecta você. Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      destructive: true,
      onConfirm: excluirConta,
    });
  }

  async function excluirConta() {
    if (!session) return;
    try {
      if (provider) {
        // apaga o anúncio (cascata: fotos e avaliações recebidas)
        await supabase.from('providers').delete().eq('id', provider.id);
      }
      // avaliações escritas pelo usuário e dados pessoais do perfil
      await supabase.from('reviews').delete().eq('autor_profile_id', session.user.id);
      await supabase
        .from('profiles')
        .update({ nome: null, telefone: null, endereco: null, foto_url: null, tipo: 'cliente' })
        .eq('id', session.user.id);
      await signOut();
      notify('Conta excluída', 'Seus dados foram removidos e você foi desconectado.');
    } catch (e) {
      notify('Excluir conta', e instanceof Error ? e.message : 'Não foi possível excluir agora.');
    }
  }

  // --- Não logado ---------------------------------------------------------
  if (!session) {
    return (
      <AppBackground>
        <View style={[styles.centro, { paddingTop: insets.top }]}>
          <GlassCard borderRadius={28} style={styles.iconeBox}>
            <UserRound size={38} color={colors.green} strokeWidth={1.8} />
          </GlassCard>
          <Text style={styles.tituloCentro}>Entre na sua conta</Text>
          <Text style={styles.textoCentro}>
            Buscar prestadores é livre. Com uma conta você avalia serviços e gerencia o seu
            anúncio.
          </Text>
          <Pressable onPress={() => router.push('/auth/login')} style={styles.botaoPrimario}>
            <Text style={styles.botaoPrimarioTexto}>Entrar ou criar conta</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/privacidade')} style={styles.linkPrivacidade}>
            <Text style={styles.linkPrivacidadeTexto}>Política de Privacidade</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  if (carregando) {
    return (
      <AppBackground>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.green} />
        </View>
      </AppBackground>
    );
  }

  // --- Logado -------------------------------------------------------------
  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 22 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.titulo}>Meu perfil</Text>

          {/* ---- Meus dados ---- */}
          <View style={styles.fotoWrapper}>
            <Pressable onPress={trocarFoto} disabled={subindoFoto}>
              {pFotoUrl ? (
                <Image source={{ uri: pFotoUrl }} style={styles.fotoPerfil} contentFit="cover" />
              ) : (
                <Avatar nome={pNome || profile?.nome || 'Você'} size={92} />
              )}
              <View style={styles.fotoBadge}>
                {subindoFoto ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Camera size={16} color={colors.white} strokeWidth={2} />
                )}
              </View>
            </Pressable>
          </View>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={pNome}
            onChangeText={setPNome}
            placeholder="Seu nome"
            placeholderTextColor={colors.gray}
            style={styles.campo}
          />

          <Text style={styles.label}>E-mail</Text>
          <View style={[styles.campo, styles.campoReadonly]}>
            <Text style={styles.campoReadonlyTexto}>{session.user.email}</Text>
          </View>

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            value={pTelefone}
            onChangeText={setPTelefone}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.gray}
            style={styles.campo}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Endereço</Text>
          <TextInput
            value={pEndereco}
            onChangeText={setPEndereco}
            placeholder="Cidade, estado"
            placeholderTextColor={colors.gray}
            style={styles.campo}
          />

          <Pressable
            onPress={salvarDados}
            disabled={salvandoDados}
            style={[styles.botaoPrimario, styles.botaoSalvar, salvandoDados && styles.desabilitado]}
          >
            {salvandoDados ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.botaoPrimarioTexto}>Salvar dados</Text>
            )}
          </Pressable>

          {/* ---- Meu anúncio ---- */}
          <View style={styles.separador} />
          <Text style={styles.secaoTitulo}>Meu anúncio</Text>

          {provider ? (
            <>
              <GlassCard borderRadius={radius.cardLg} style={styles.cartao}>
                <View style={styles.cartaoTopo}>
                  <Avatar nome={provider.nome_negocio} cor={provider.cor} size={56} />
                  <View style={styles.flex}>
                    <Text style={styles.cartaoNome}>{provider.nome_negocio}</Text>
                    {provider.verificado ? (
                      <VerifiedBadge mini />
                    ) : (
                      <Text
                        style={[
                          styles.statusTexto,
                          provider.aprovado ? styles.statusAprovado : styles.statusPendente,
                        ]}
                      >
                        {provider.aprovado ? 'No ar' : 'Aguardando aprovação'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.views}>
                    <Eye size={15} color={colors.green} strokeWidth={2.2} />
                    <Text style={styles.viewsNumero}>{provider.visualizacoes}</Text>
                    <Text style={styles.viewsRotulo}>visualizações</Text>
                  </View>
                </View>
              </GlassCard>

              <Text style={styles.label}>Nome do negócio</Text>
              <TextInput value={nome} onChangeText={setNome} style={styles.campo} />

              <Text style={styles.label}>Categoria</Text>
              <View style={styles.chips}>
                {categorias.map((c) => (
                  <CategoryChip
                    key={c.slug}
                    categoria={c}
                    ativa={categoria === c.slug}
                    onPress={() => setCategoria(c.slug)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Cidade principal</Text>
              <TextInput value={cidade} onChangeText={setCidade} style={styles.campo} />

              <Text style={styles.label}>Outras cidades que atende</Text>
              <TextInput
                value={cidadesAtendidas}
                onChangeText={setCidadesAtendidas}
                placeholder="Separe por vírgula"
                placeholderTextColor={colors.gray}
                style={styles.campo}
              />

              <Text style={styles.label}>WhatsApp</Text>
              <TextInput
                value={whatsapp}
                onChangeText={setWhatsapp}
                style={styles.campo}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Descrição do serviço</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                style={[styles.campo, styles.campoBio]}
                multiline
              />

              <Pressable
                onPress={salvarAnuncio}
                disabled={salvando}
                style={[styles.botaoPrimario, styles.botaoSalvar, salvando && styles.desabilitado]}
              >
                {salvando ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.botaoPrimarioTexto}>Salvar anúncio</Text>
                )}
              </Pressable>
            </>
          ) : (
            <View style={styles.semAnuncio}>
              <Text style={styles.semAnuncioTexto}>
                Você ainda não tem um anúncio. Presta algum serviço? Cadastre-se grátis e apareça
                na busca.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/anunciar')}
                style={styles.botaoPrimario}
              >
                <Text style={styles.botaoPrimarioTexto}>Anunciar meu serviço</Text>
              </Pressable>
            </View>
          )}

          {/* ---- Configurações ---- */}
          <View style={styles.separador} />
          <Text style={styles.secaoTitulo}>Configurações</Text>
          <View style={styles.settingsCard}>
            <Pressable
              style={styles.settingsRow}
              onPress={() => router.push('/privacidade')}
            >
              <ShieldCheck size={18} color={colors.green} strokeWidth={2} />
              <Text style={styles.settingsTexto}>Política de Privacidade</Text>
              <ChevronRight size={18} color={colors.gray} />
            </Pressable>
            <View style={styles.settingsDivisor} />
            <Pressable style={styles.settingsRow} onPress={confirmarExclusao}>
              <Trash2 size={18} color="#B23A3A" strokeWidth={2} />
              <Text style={[styles.settingsTexto, styles.settingsPerigo]}>Excluir minha conta</Text>
              <ChevronRight size={18} color={colors.gray} />
            </Pressable>
          </View>

          <Pressable onPress={signOut} style={styles.sairBotao}>
            <LogOut size={17} color="#B23A3A" strokeWidth={2} />
            <Text style={styles.sairBotaoTexto}>Sair do aplicativo</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconeBox: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCentro: {
    fontFamily: fonts.displayHeavy,
    fontSize: 22,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  textoCentro: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.gray,
    textAlign: 'center',
  },
  botaoPrimario: {
    backgroundColor: colors.green,
    borderRadius: radius.input,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: colors.green,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  botaoPrimarioTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
  botaoSalvar: {
    marginTop: 20,
  },
  desabilitado: {
    opacity: 0.7,
  },
  fotoWrapper: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  fotoPerfil: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.line,
  },
  fotoBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  campoReadonly: {
    justifyContent: 'center',
    backgroundColor: 'rgba(16,27,22,0.04)',
  },
  campoReadonlyTexto: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.gray,
  },
  separador: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: 28,
    marginBottom: 4,
  },
  secaoTitulo: {
    fontFamily: fonts.displayHeavy,
    fontSize: 18,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 6,
  },
  semAnuncio: {
    marginTop: 8,
  },
  semAnuncioTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray,
  },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 26,
    alignSelf: 'center',
    paddingBottom: 4,
  },
  sairTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gray,
  },
  linkPrivacidade: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  linkPrivacidadeTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.green,
    textDecorationLine: 'underline',
  },
  settingsCard: {
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  settingsTexto: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  settingsPerigo: {
    color: '#B23A3A',
  },
  settingsDivisor: {
    height: 1,
    backgroundColor: colors.line,
    marginLeft: 44,
  },
  sairBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: '#E4C4C4',
    backgroundColor: 'rgba(178,58,58,0.06)',
  },
  sairBotaoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#B23A3A',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  titulo: {
    fontFamily: fonts.displayHeavy,
    fontSize: 24,
    color: colors.ink,
    marginBottom: 14,
  },
  cartao: {
    padding: 16,
  },
  cartaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartaoNome: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  statusTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  statusAprovado: {
    color: colors.green,
  },
  statusPendente: {
    color: '#B07B00',
  },
  views: {
    alignItems: 'center',
  },
  viewsNumero: {
    fontFamily: fonts.displayHeavy,
    fontSize: 17,
    color: colors.green,
  },
  viewsRotulo: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.gray,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
    marginTop: 14,
    marginBottom: 6,
  },
  campo: {
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  campoBio: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
});
