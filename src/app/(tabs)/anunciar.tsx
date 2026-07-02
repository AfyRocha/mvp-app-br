import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ImagePlus, PartyPopper, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
import { CategoryChip } from '@/components/category-chip';
import { GlassCard } from '@/components/glass';
import { useAuth } from '@/lib/auth';
import {
  addProviderPhoto,
  createProvider,
  fetchCategories,
  fetchMyProvider,
  uploadProviderPhoto,
} from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { colors, fonts, glass, radius } from '@/theme';

const MAX_FOTOS = 6;

export default function AnunciarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, refreshProfile } = useAuth();

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [jaTemAnuncio, setJaTemAnuncio] = useState(false);

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [cidade, setCidade] = useState('');
  const [cidadesAtendidas, setCidadesAtendidas] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchMyProvider(session.user.id)
      .then((p) => setJaTemAnuncio(Boolean(p)))
      .catch(() => {});
  }, [session, enviado]);

  const ok = nome.trim() && categoria && cidade.trim() && whatsapp.trim();

  async function escolherFotos() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_FOTOS - fotos.length,
      quality: 0.8,
    });
    if (!resultado.canceled) {
      const novas = resultado.assets.map((a) => a.uri);
      setFotos((f) => [...f, ...novas].slice(0, MAX_FOTOS));
    }
  }

  async function enviar() {
    if (!ok || enviando) return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setEnviando(true);
    try {
      const provider = await createProvider({
        profile_id: session.user.id,
        nome_negocio: nome.trim(),
        categoria: categoria!,
        bio: bio.trim(),
        cidade_principal: cidade.trim(),
        cidades_atendidas: cidadesAtendidas
          .split(/[,·;]/)
          .map((c) => c.trim())
          .filter(Boolean),
        whatsapp: whatsapp.replace(/\D/g, ''),
      });

      for (let i = 0; i < fotos.length; i++) {
        const url = await uploadProviderPhoto(session.user.id, fotos[i], i);
        await addProviderPhoto(provider.id, url, i);
      }

      // marca o perfil como prestador
      await supabase.from('profiles').update({ tipo: 'prestador' }).eq('id', session.user.id);
      await refreshProfile();

      setEnviado(true);
    } catch (e) {
      Alert.alert('Anunciar', e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setEnviando(false);
    }
  }

  function limpar() {
    setEnviado(false);
    setNome('');
    setCategoria(null);
    setCidade('');
    setCidadesAtendidas('');
    setWhatsapp('');
    setBio('');
    setFotos([]);
  }

  if (enviado) {
    return (
      <AppBackground>
        <View style={[styles.sucesso, { paddingTop: insets.top + 60 }]}>
          <GlassCard borderRadius={28} style={styles.sucessoIcone}>
            <PartyPopper size={42} color={colors.green} strokeWidth={1.8} />
          </GlassCard>
          <Text style={styles.sucessoTitulo}>Cadastro enviado!</Text>
          <Text style={styles.sucessoTexto}>
            Seu perfil entra no ar assim que for aprovado. Você vai receber uma mensagem no
            WhatsApp <Text style={styles.sucessoDestaque}>{whatsapp}</Text> com os próximos passos.
          </Text>
          <Pressable onPress={limpar} style={styles.sucessoBotao}>
            <Text style={styles.sucessoBotaoTexto}>Cadastrar outro perfil</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

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
          <Text style={styles.titulo}>Anuncie seu serviço</Text>
          <Text style={styles.subtitulo}>
            Grátis para começar. Apareça para milhares de brasileiros na sua região.
          </Text>

          {session && jaTemAnuncio && (
            <View style={styles.avisoAnuncio}>
              <Text style={styles.avisoAnuncioTexto}>
                Você já tem um anúncio. Para editá-lo, use a aba{' '}
                <Text
                  style={styles.avisoAnuncioLink}
                  onPress={() => router.push('/(tabs)/perfil')}
                >
                  Perfil
                </Text>
                . O formulário abaixo cria um anúncio adicional.
              </Text>
            </View>
          )}

          <Text style={styles.label}>Seu nome ou nome do negócio</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Márcia Cleaning"
            placeholderTextColor={colors.gray}
            style={styles.campo}
          />

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
          <TextInput
            value={cidade}
            onChangeText={setCidade}
            placeholder="Ex.: Orlando, FL"
            placeholderTextColor={colors.gray}
            style={styles.campo}
          />

          <Text style={styles.label}>Outras cidades que atende (opcional)</Text>
          <TextInput
            value={cidadesAtendidas}
            onChangeText={setCidadesAtendidas}
            placeholder="Ex.: Kissimmee, Winter Garden"
            placeholderTextColor={colors.gray}
            style={styles.campo}
          />

          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+1 (407) 555-0123"
            placeholderTextColor={colors.gray}
            style={styles.campo}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Descreva seu serviço</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="O que você faz, regiões que atende, diferenciais…"
            placeholderTextColor={colors.gray}
            style={[styles.campo, styles.campoBio]}
            multiline
          />

          <Text style={styles.label}>Fotos do seu trabalho (opcional)</Text>
          <View style={styles.fotosLinha}>
            {fotos.map((uri) => (
              <View key={uri} style={styles.fotoBox}>
                <Image source={{ uri }} style={styles.foto} contentFit="cover" />
                <Pressable
                  onPress={() => setFotos((f) => f.filter((u) => u !== uri))}
                  style={styles.fotoRemover}
                  hitSlop={6}
                >
                  <X size={12} color={colors.white} strokeWidth={2.6} />
                </Pressable>
              </View>
            ))}
            {fotos.length < MAX_FOTOS && (
              <Pressable onPress={escolherFotos} style={styles.fotoAdicionar}>
                <ImagePlus size={22} color={colors.green} strokeWidth={1.8} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={enviar}
            disabled={!ok || enviando}
            style={[styles.botao, (!ok || enviando) && styles.botaoDesabilitado]}
          >
            {enviando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.botaoTexto, !ok && styles.botaoTextoDesabilitado]}>
                {session ? 'Enviar cadastro grátis' : 'Entrar e enviar cadastro'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.rodape}>
            Depois você pode ativar o plano Destaque: topo da busca, selo verificado e
            estatísticas.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  titulo: {
    fontFamily: fonts.displayHeavy,
    fontSize: 24,
    color: colors.ink,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.gray,
    marginTop: 6,
    marginBottom: 4,
  },
  avisoAnuncio: {
    backgroundColor: 'rgba(255,201,66,0.25)',
    borderWidth: 1,
    borderColor: colors.yellow,
    borderRadius: radius.card,
    padding: 12,
    marginTop: 12,
  },
  avisoAnuncioTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  avisoAnuncioLink: {
    fontFamily: fonts.bodyBold,
    color: colors.green,
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
  fotosLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fotoBox: {
    width: 72,
    height: 72,
  },
  foto: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: colors.line,
  },
  fotoRemover: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoAdicionar: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.green,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.surface,
  },
  botao: {
    backgroundColor: colors.green,
    borderRadius: radius.input,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.green,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  botaoDesabilitado: {
    backgroundColor: 'rgba(16,27,22,0.10)',
    shadowOpacity: 0,
    elevation: 0,
  },
  botaoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
  botaoTextoDesabilitado: {
    color: colors.gray,
  },
  rodape: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 10,
  },
  sucesso: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  sucessoIcone: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sucessoTitulo: {
    fontFamily: fonts.displayHeavy,
    fontSize: 24,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  sucessoTexto: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.gray,
    textAlign: 'center',
  },
  sucessoDestaque: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  sucessoBotao: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: radius.chip,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 24,
  },
  sucessoBotaoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.green,
  },
});
