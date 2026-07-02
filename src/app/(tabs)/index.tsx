import { useRouter } from 'expo-router';
import { Check, MapPin, Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { CategoryChip } from '@/components/category-chip';
import { EmptyState } from '@/components/empty-state';
import { GlassOnGreen } from '@/components/glass';
import { GradientHeader } from '@/components/gradient-header';
import { Logo } from '@/components/logo';
import { ProviderCard } from '@/components/provider-card';
import { fetchCategories, fetchProviders } from '@/lib/queries';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Category, ProviderWithRating } from '@/lib/types';
import { colors, fonts, radius } from '@/theme';

export default function InicioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [prestadores, setPrestadores] = useState<ProviderWithRating[]>([]);
  const [carregando, setCarregando] = useState(isSupabaseConfigured);
  const [atualizando, setAtualizando] = useState(false);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const erro = isSupabaseConfigured
    ? erroCarga
    : 'Configure o Supabase no arquivo .env para ver os prestadores.';

  const [busca, setBusca] = useState('');
  const [catAtiva, setCatAtiva] = useState<string | null>(null);
  const [cidade, setCidade] = useState<string | null>(null);
  const [seletorCidade, setSeletorCidade] = useState(false);

  function carregar() {
    if (!isSupabaseConfigured) return;
    Promise.all([fetchCategories(), fetchProviders()])
      .then(([cats, provs]) => {
        setCategorias(cats);
        setPrestadores(provs);
        setErroCarga(null);
      })
      .catch((e) => {
        setErroCarga(e instanceof Error ? e.message : 'Não foi possível carregar os prestadores.');
      })
      .finally(() => {
        setCarregando(false);
        setAtualizando(false);
      });
  }

  useEffect(() => {
    carregar();
  }, []);

  const cidades = useMemo(
    () => [...new Set(prestadores.map((p) => p.cidade_principal))].sort(),
    [prestadores]
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return prestadores.filter((p) => {
      const okCat = !catAtiva || p.categoria === catAtiva;
      const okCidade =
        !cidade ||
        p.cidade_principal === cidade ||
        p.cidades_atendidas.some((c) => cidade.startsWith(c) || c.startsWith(cidade));
      const okBusca =
        !q ||
        p.nome_negocio.toLowerCase().includes(q) ||
        (p.bio ?? '').toLowerCase().includes(q) ||
        p.cidade_principal.toLowerCase().includes(q) ||
        p.categoria_nome.toLowerCase().includes(q);
      return okCat && okCidade && okBusca;
    });
  }, [prestadores, busca, catAtiva, cidade]);

  const plural = filtrados.length !== 1;

  return (
    <AppBackground>
      <FlatList
        data={filtrados}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <ProviderCard provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
            tintColor={colors.green}
          />
        }
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <GradientHeader style={[styles.header, { paddingTop: insets.top + 20 }]}>
              <View style={styles.headerTopo}>
                <Logo />
                <Pressable onPress={() => setSeletorCidade(true)}>
                  <GlassOnGreen style={styles.chipLocal}>
                    <MapPin size={13} color={colors.onGreen} />
                    <Text style={styles.chipLocalTexto}>{cidade ?? 'Todas as cidades'}</Text>
                  </GlassOnGreen>
                </Pressable>
              </View>
              <Text style={styles.headline}>Gente, tem brasileiro que faz…?</Text>
              <GlassOnGreen borderRadius={radius.input} style={styles.buscaBox}>
                <Search size={17} color={colors.onGreen} />
                <TextInput
                  value={busca}
                  onChangeText={setBusca}
                  placeholder="limpeza, taxes, fotógrafo…"
                  placeholderTextColor="rgba(255,255,255,0.65)"
                  style={styles.buscaInput}
                  returnKeyType="search"
                />
              </GlassOnGreen>
            </GradientHeader>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categorias.map((c) => (
                <CategoryChip
                  key={c.slug}
                  categoria={c}
                  ativa={catAtiva === c.slug}
                  onPress={() => setCatAtiva(catAtiva === c.slug ? null : c.slug)}
                />
              ))}
            </ScrollView>

            <View style={styles.contadorBox}>
              {carregando ? (
                <ActivityIndicator color={colors.green} style={styles.loading} />
              ) : erro ? (
                <Text style={styles.erro}>{erro}</Text>
              ) : (
                <Text style={styles.contador}>
                  {filtrados.length} prestador{plural ? 'es' : ''} encontrado{plural ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={!carregando && !erro ? <EmptyState /> : null}
      />

      {/* Seletor de cidade */}
      <Modal
        visible={seletorCidade}
        transparent
        animationType="fade"
        onRequestClose={() => setSeletorCidade(false)}
      >
        <Pressable style={styles.modalFundo} onPress={() => setSeletorCidade(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Onde você está?</Text>
            {[null, ...cidades].map((c) => {
              const selecionada = cidade === c;
              return (
                <Pressable
                  key={c ?? 'todas'}
                  onPress={() => {
                    setCidade(c);
                    setSeletorCidade(false);
                  }}
                  style={styles.modalOpcao}
                >
                  <Text
                    style={[styles.modalOpcaoTexto, selecionada && styles.modalOpcaoSelecionada]}
                  >
                    {c ?? 'Todas as cidades'}
                  </Text>
                  {selecionada && <Check size={16} color={colors.green} strokeWidth={2.4} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingBottom: 96,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  headerTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chipLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipLocalTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.onGreen,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    color: colors.white,
    marginTop: 14,
    marginBottom: 16,
  },
  buscaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    height: 50,
  },
  buscaInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.white,
    height: '100%',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  contadorBox: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },
  contador: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  erro: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gray,
  },
  loading: {
    marginTop: 8,
  },
  itemWrapper: {
    paddingHorizontal: 20,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(16,27,22,0.4)',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.cardLg,
    padding: 20,
  },
  modalTitulo: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 10,
  },
  modalOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  modalOpcaoTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.ink,
  },
  modalOpcaoSelecionada: {
    fontFamily: fonts.bodyBold,
    color: colors.green,
  },
});
