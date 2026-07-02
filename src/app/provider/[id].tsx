import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ChevronLeft, MapPin, MessageCircle, Star } from 'lucide-react-native';
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
import { EmptyState } from '@/components/empty-state';
import { GlassCard, GlassOnGreen } from '@/components/glass';
import { GradientHeader } from '@/components/gradient-header';
import { Stars } from '@/components/stars';
import { VerifiedBadge } from '@/components/verified-badge';
import { useAuth } from '@/lib/auth';
import {
  fetchProviderById,
  fetchProviderPhotos,
  fetchReviews,
  incrementProviderView,
  submitReview,
} from '@/lib/queries';
import type { ProviderPhoto, ProviderWithRating, Review } from '@/lib/types';
import { colors, fonts, glass, radius } from '@/theme';

const MENSAGEM_WHATSAPP = 'Olá! Te encontrei no tem brasileiro 👋';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [provider, setProvider] = useState<ProviderWithRating | null>(null);
  const [fotos, setFotos] = useState<ProviderPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [notaNova, setNotaNova] = useState(0);
  const [textoNovo, setTextoNovo] = useState('');
  const [enviandoReview, setEnviandoReview] = useState(false);

  const carregarReviews = useCallback(async () => {
    if (!id) return;
    const [p, r] = await Promise.all([fetchProviderById(id), fetchReviews(id)]);
    setProvider(p);
    setReviews(r);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [p, f, r] = await Promise.all([
          fetchProviderById(id),
          fetchProviderPhotos(id),
          fetchReviews(id),
        ]);
        setProvider(p);
        setFotos(f);
        setReviews(r);
        if (p) incrementProviderView(p.id);
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  function abrirWhatsApp() {
    if (!provider) return;
    const numero = provider.whatsapp.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${numero}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`);
  }

  async function enviarReview() {
    if (!provider || !session) return;
    if (notaNova === 0) {
      Alert.alert('Avaliação', 'Escolha uma nota de 1 a 5 estrelas.');
      return;
    }
    setEnviandoReview(true);
    try {
      await submitReview({
        provider_id: provider.id,
        autor_profile_id: session.user.id,
        nota: notaNova,
        texto: textoNovo.trim(),
      });
      setNotaNova(0);
      setTextoNovo('');
      await carregarReviews();
    } catch (e) {
      Alert.alert('Avaliação', e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setEnviandoReview(false);
    }
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

  if (!provider) {
    return (
      <AppBackground>
        <View style={styles.centro}>
          <EmptyState
            mensagem="Este prestador não está disponível."
            convite="Ele pode estar aguardando aprovação."
          />
          <Pressable onPress={() => router.back()} style={styles.botaoVoltarVazio}>
            <Text style={styles.botaoVoltarVazioTexto}>Voltar para a busca</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  const nota = provider.nota_media ?? 0;
  const anos = provider.desde ? new Date().getFullYear() - provider.desde : null;
  const minhaReview = session
    ? reviews.find((r) => r.autor_profile_id === session.user.id)
    : undefined;

  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <GradientHeader style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <Pressable onPress={() => router.back()} style={styles.voltarWrapper}>
              <GlassOnGreen style={styles.voltar}>
                <ChevronLeft size={15} color={colors.white} />
                <Text style={styles.voltarTexto}>Voltar</Text>
              </GlassOnGreen>
            </Pressable>
          </GradientHeader>

          <View style={styles.conteudo}>
            {/* Cartão flutuante de vidro */}
            <View style={styles.cartaoFlutuante}>
              <GlassCard borderRadius={radius.cardLg} style={styles.cartao}>
                <View style={styles.cartaoTopo}>
                  <Avatar nome={provider.nome_negocio} cor={provider.cor} size={64} />
                  <View style={styles.flex}>
                    <Text style={styles.nome}>{provider.nome_negocio}</Text>
                    <Text style={styles.meta}>
                      {provider.categoria_nome}
                      {provider.desde ? ` · desde ${provider.desde}` : ''}
                    </Text>
                    {provider.verificado && <VerifiedBadge />}
                  </View>
                </View>
                <View style={styles.stats}>
                  <Stat valor={nota > 0 ? nota.toFixed(1) : '—'} rotulo="nota média" />
                  <Stat valor={String(provider.total_avaliacoes)} rotulo="avaliações" />
                  <Stat valor={anos !== null ? `${anos} anos` : '—'} rotulo="de atuação" />
                </View>
              </GlassCard>
            </View>

            <Secao titulo="Sobre">
              {!!provider.bio && <Text style={styles.bio}>{provider.bio}</Text>}
              <View style={styles.atendeLinha}>
                <MapPin size={14} color={colors.gray} />
                <Text style={styles.atendeTexto}>
                  Atende: <Text style={styles.atendeDestaque}>
                    {provider.cidades_atendidas.length > 0
                      ? provider.cidades_atendidas.join(' · ')
                      : provider.cidade_principal}
                  </Text>
                </Text>
              </View>
            </Secao>

            {provider.servicos.length > 0 && (
              <Secao titulo="Serviços">
                <View style={styles.servicos}>
                  {provider.servicos.map((s) => (
                    <View key={s} style={styles.servicoChip}>
                      <Text style={styles.servicoTexto}>{s}</Text>
                    </View>
                  ))}
                </View>
              </Secao>
            )}

            {fotos.length > 0 && (
              <Secao titulo="Fotos">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.galeria}>
                    {fotos.map((f) => (
                      <Image
                        key={f.id}
                        source={{ uri: f.url }}
                        style={styles.foto}
                        contentFit="cover"
                      />
                    ))}
                  </View>
                </ScrollView>
              </Secao>
            )}

            <Secao titulo="Avaliações">
              <View style={styles.notaResumo}>
                <Stars nota={nota} />
                <Text style={styles.notaResumoTexto}>
                  {provider.total_avaliacoes > 0
                    ? `${nota.toFixed(1)} · ${provider.total_avaliacoes} avaliaç${provider.total_avaliacoes !== 1 ? 'ões' : 'ão'}`
                    : 'Seja o primeiro a avaliar'}
                </Text>
              </View>

              {reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  {!!r.texto && <Text style={styles.reviewTexto}>“{r.texto}”</Text>}
                  <View style={styles.reviewRodape}>
                    <Stars nota={r.nota} size={11} />
                    <Text style={styles.reviewAutor}>
                      — {r.autor_nome ?? 'Cliente'}, {dataRelativa(r.criado_em)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Formulário de avaliação (exige login) */}
              {session ? (
                <View style={styles.formReview}>
                  <Text style={styles.formTitulo}>
                    {minhaReview ? 'Atualize sua avaliação' : 'Deixe sua avaliação'}
                  </Text>
                  <View style={styles.formEstrelas}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Pressable key={i} onPress={() => setNotaNova(i)} hitSlop={6}>
                        <Star
                          size={26}
                          fill={i <= notaNova ? colors.yellow : 'none'}
                          color={i <= notaNova ? colors.yellow : colors.line}
                          strokeWidth={1.5}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={textoNovo}
                    onChangeText={setTextoNovo}
                    placeholder="Conte como foi o serviço…"
                    placeholderTextColor={colors.gray}
                    multiline
                    style={styles.formCampo}
                  />
                  <Pressable
                    onPress={enviarReview}
                    disabled={enviandoReview}
                    style={[styles.formEnviar, enviandoReview && styles.desabilitado]}
                  >
                    <Text style={styles.formEnviarTexto}>
                      {enviandoReview ? 'Enviando…' : 'Enviar avaliação'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => router.push('/auth/login')}
                  style={styles.entrarParaAvaliar}
                >
                  <Text style={styles.entrarParaAvaliarTexto}>Entrar para avaliar</Text>
                </Pressable>
              )}
            </Secao>
          </View>
        </ScrollView>

        {/* Botão fixo de WhatsApp */}
        <View style={[styles.whatsWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable onPress={abrirWhatsApp} style={styles.whatsBotao}>
            <MessageCircle size={19} color={colors.white} fill={colors.white} strokeWidth={0} />
            <Text style={styles.whatsTexto}>Chamar no WhatsApp</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

function Stat({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statRotulo}>{rotulo}</Text>
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function dataRelativa(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias < 1) return 'hoje';
  if (dias < 7) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `há ${semanas} semana${semanas > 1 ? 's' : ''}`;
  }
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return `há ${meses} m${meses > 1 ? 'eses' : 'ês'}`;
  }
  const anos = Math.floor(dias / 365);
  return `há ${anos} ano${anos > 1 ? 's' : ''}`;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 56,
  },
  voltarWrapper: {
    alignSelf: 'flex-start',
  },
  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  voltarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.white,
  },
  conteudo: {
    paddingHorizontal: 20,
  },
  cartaoFlutuante: {
    marginTop: -40,
    shadowColor: colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    borderRadius: radius.cardLg,
  },
  cartao: {
    padding: 18,
  },
  cartaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nome: {
    fontFamily: fonts.displayHeavy,
    fontSize: 19,
    lineHeight: 23,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray,
    marginTop: 3,
    marginBottom: 5,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,27,22,0.08)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValor: {
    fontFamily: fonts.displayHeavy,
    fontSize: 17,
    color: colors.green,
  },
  statRotulo: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.gray,
  },
  secao: {
    marginVertical: 18,
  },
  secaoTitulo: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 8,
  },
  bio: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21.7,
    color: colors.ink,
  },
  atendeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  atendeTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray,
    flex: 1,
  },
  atendeDestaque: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  servicos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  servicoChip: {
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.chip,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  servicoTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  galeria: {
    flexDirection: 'row',
    gap: 8,
  },
  foto: {
    width: 132,
    height: 132,
    borderRadius: radius.card,
    backgroundColor: colors.line,
  },
  notaResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notaResumoTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray,
  },
  reviewCard: {
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  reviewTexto: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
  },
  reviewRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  reviewAutor: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray,
  },
  formReview: {
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.card,
    padding: 14,
    marginTop: 6,
  },
  formTitulo: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 8,
  },
  formEstrelas: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  formCampo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  formEnviar: {
    backgroundColor: colors.green,
    borderRadius: radius.input,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  formEnviarTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
  entrarParaAvaliar: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: radius.chip,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  entrarParaAvaliarTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.green,
  },
  desabilitado: {
    opacity: 0.6,
  },
  whatsWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
  },
  whatsBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.whatsapp,
    borderRadius: radius.input,
    paddingVertical: 16,
    shadowColor: colors.whatsapp,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  whatsTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
  botaoVoltarVazio: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: radius.chip,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 4,
  },
  botaoVoltarVazioTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.green,
  },
});
