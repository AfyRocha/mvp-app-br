import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
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
import { GradientHeader } from '@/components/gradient-header';
import { Logo } from '@/components/logo';
import { notify } from '@/lib/feedback';
import { supabase } from '@/lib/supabase';
import { colors, fonts, glass, radius } from '@/theme';

type Modo = 'entrar' | 'cadastrar';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const podeEnviar =
    email.trim().length > 3 &&
    senha.length >= 6 &&
    (modo === 'entrar' || (nome.trim().length > 1 && aceito));

  async function enviar() {
    if (!podeEnviar || enviando) return;
    setEnviando(true);
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { data: { nome: nome.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          notify(
            'Confirme seu e-mail',
            'Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, volte e entre.'
          );
        }
      }
      router.back();
    } catch (e) {
      notify(
        modo === 'entrar' ? 'Entrar' : 'Criar conta',
        e instanceof Error ? traduzErro(e.message) : 'Algo deu errado. Tente de novo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <GradientHeader style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerTopo}>
              <Logo />
              <Pressable onPress={() => router.back()} hitSlop={8} style={styles.fechar}>
                <X size={18} color={colors.white} />
              </Pressable>
            </View>
            <Text style={styles.headline}>
              {modo === 'entrar' ? 'Bom te ver de novo!' : 'Crie sua conta grátis'}
            </Text>
            <Text style={styles.subtitulo}>
              {modo === 'entrar'
                ? 'Entre para avaliar prestadores e anunciar seu serviço.'
                : 'Buscar é livre — a conta serve para avaliar e anunciar.'}
            </Text>
          </GradientHeader>

          <View style={styles.form}>
            {modo === 'cadastrar' && (
              <>
                <Text style={styles.label}>Seu nome</Text>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Ex.: Maria Silva"
                  placeholderTextColor={colors.gray}
                  style={styles.campo}
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              placeholderTextColor={colors.gray}
              style={styles.campo}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.gray}
              style={styles.campo}
              secureTextEntry
            />

            {modo === 'cadastrar' && (
              <Pressable
                onPress={() => setAceito((v) => !v)}
                style={styles.consentimento}
                hitSlop={6}
              >
                <View style={[styles.checkbox, aceito && styles.checkboxMarcado]}>
                  {aceito && <Check size={14} color={colors.white} strokeWidth={3} />}
                </View>
                <Text style={styles.consentimentoTexto}>
                  Li e aceito a{' '}
                  <Text
                    style={styles.link}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      router.push('/privacidade');
                    }}
                  >
                    Política de Privacidade
                  </Text>{' '}
                  e o tratamento dos meus dados conforme a LGPD.
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={enviar}
              disabled={!podeEnviar || enviando}
              style={[styles.botao, (!podeEnviar || enviando) && styles.botaoDesabilitado]}
            >
              {enviando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.botaoTexto, !podeEnviar && styles.botaoTextoDesabilitado]}>
                  {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')}
              style={styles.trocarModo}
            >
              <Text style={styles.trocarModoTexto}>
                {modo === 'entrar' ? (
                  <>
                    Ainda não tem conta? <Text style={styles.trocarModoLink}>Cadastre-se</Text>
                  </>
                ) : (
                  <>
                    Já tem conta? <Text style={styles.trocarModoLink}>Entrar</Text>
                  </>
                )}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

function traduzErro(mensagem: string): string {
  if (/invalid login credentials/i.test(mensagem)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(mensagem)) return 'Este e-mail já tem uma conta. Tente entrar.';
  if (/email not confirmed/i.test(mensagem))
    return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (/at least 6 characters/i.test(mensagem)) return 'A senha precisa ter no mínimo 6 caracteres.';
  return mensagem;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  headerTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: glass.onGreen,
    borderWidth: 1,
    borderColor: glass.onGreenBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: fonts.displayHeavy,
    fontSize: 24,
    color: colors.white,
    marginTop: 18,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onGreen,
    marginTop: 6,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  consentimento: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxMarcado: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  consentimentoTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray,
  },
  link: {
    fontFamily: fonts.bodyBold,
    color: colors.green,
  },
  trocarModo: {
    alignItems: 'center',
    marginTop: 16,
  },
  trocarModoTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray,
  },
  trocarModoLink: {
    fontFamily: fonts.bodyBold,
    color: colors.green,
  },
});
