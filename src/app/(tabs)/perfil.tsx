import { useRouter } from 'expo-router';
import { Eye, LogOut, UserRound } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { fetchCategories, fetchMyProvider, updateProvider } from '@/lib/queries';
import type { Category, Provider } from '@/lib/types';
import { colors, fonts, glass, radius } from '@/theme';

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, profile, signOut } = useAuth();

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [carregando, setCarregando] = useState(true);

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
      .catch(() => {
        // sem conexão/config: mantém tela básica
      })
      .finally(() => setCarregando(false));
  }, [session]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar() {
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
      Alert.alert('Meu perfil', 'Dados atualizados!');
    } catch (e) {
      Alert.alert('Meu perfil', e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  // --- Não logado -------------------------------------------------------
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

  // --- Logado sem anúncio -----------------------------------------------
  if (!provider) {
    return (
      <AppBackground>
        <View style={[styles.centro, { paddingTop: insets.top }]}>
          <Avatar nome={profile?.nome ?? 'Você'} size={72} />
          <Text style={styles.tituloCentro}>{profile?.nome ?? session.user.email}</Text>
          <Text style={styles.textoCentro}>
            Você ainda não tem um anúncio. Presta algum serviço? Cadastre-se grátis e apareça na
            busca.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/anunciar')}
            style={styles.botaoPrimario}
          >
            <Text style={styles.botaoPrimarioTexto}>Anunciar meu serviço</Text>
          </Pressable>
          <Pressable onPress={signOut} style={styles.sair}>
            <LogOut size={15} color={colors.gray} />
            <Text style={styles.sairTexto}>Sair da conta</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/privacidade')} style={styles.linkPrivacidade}>
            <Text style={styles.linkPrivacidadeTexto}>Política de Privacidade</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  // --- Logado com anúncio (prestador) -------------------------------------
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

          <Text style={styles.label}>Seu nome ou nome do negócio</Text>
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
            onPress={salvar}
            disabled={salvando}
            style={[styles.botaoPrimario, styles.botaoSalvar, salvando && styles.desabilitado]}
          >
            {salvando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.botaoPrimarioTexto}>Salvar alterações</Text>
            )}
          </Pressable>

          <Pressable onPress={signOut} style={styles.sair}>
            <LogOut size={15} color={colors.gray} />
            <Text style={styles.sairTexto}>Sair da conta</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/privacidade')} style={styles.linkPrivacidade}>
            <Text style={styles.linkPrivacidadeTexto}>Política de Privacidade</Text>
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
    marginTop: 24,
  },
  desabilitado: {
    opacity: 0.7,
  },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
    alignSelf: 'center',
    paddingBottom: 8,
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
