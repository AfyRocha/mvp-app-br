import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { GradientHeader } from '@/components/gradient-header';
import { colors, fonts, glass, radius } from '@/theme';

/** E-mail de contato do controlador para exercício dos direitos da LGPD. */
const CONTATO = 'afonsorocha.contato@gmail.com';
const ATUALIZADO_EM = '3 de julho de 2026';

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: ReactNode }) {
  return <Text style={styles.paragrafo}>{children}</Text>;
}

function Item({ children }: { children: ReactNode }) {
  return (
    <View style={styles.item}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.itemTexto}>{children}</Text>
    </View>
  );
}

export default function PrivacidadeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <GradientHeader style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopo}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.voltar}>
            <ArrowLeft size={18} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitulo}>Política de Privacidade</Text>
        </View>
        <Text style={styles.headerSub}>
          Como o ACHEI trata seus dados, conforme a LGPD (Lei nº 13.709/2018).
        </Text>
      </GradientHeader>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.atualizado}>Última atualização: {ATUALIZADO_EM}</Text>

        <Secao titulo="1. Quem é o controlador">
          <P>
            O ACHEI é um diretório que conecta clientes a prestadores de serviços
            brasileiros. O responsável pelo tratamento dos seus dados (controlador) pode ser
            contatado pelo e-mail {CONTATO}.
          </P>
        </Secao>

        <Secao titulo="2. Dados que coletamos">
          <Item>Conta: nome e e-mail informados no cadastro.</Item>
          <Item>
            Anúncio de prestador: nome do negócio, categoria, cidades atendidas, número de
            WhatsApp, descrição e fotos que você optar por publicar.
          </Item>
          <Item>
            Uso do app: contagem de visualizações do seu perfil de prestador e avaliações que
            você escrever.
          </Item>
          <P>
            Não coletamos dados sensíveis nem localização precisa. Só tratamos o que você nos
            fornece para usar o serviço.
          </P>
        </Secao>

        <Secao titulo="3. Para que usamos">
          <Item>Criar e manter sua conta e autenticar o acesso.</Item>
          <Item>Exibir prestadores aprovados na busca e permitir o contato via WhatsApp.</Item>
          <Item>Publicar avaliações e calcular a nota média dos prestadores.</Item>
          <Item>Mostrar ao prestador quantas vezes o perfil dele foi visto.</Item>
        </Secao>

        <Secao titulo="4. Base legal">
          <P>
            Tratamos seus dados com base no seu consentimento (dado no cadastro) e na execução do
            serviço que você solicita, conforme os artigos 7º e 11 da LGPD. Você pode revogar o
            consentimento a qualquer momento.
          </P>
        </Secao>

        <Secao titulo="5. Compartilhamento">
          <P>
            Informações do anúncio (incluindo o WhatsApp) são públicas na busca depois de
            aprovadas — é assim que os clientes te encontram. Não vendemos seus dados. Usamos o
            Supabase como operador de banco de dados e autenticação, que processa os dados em nosso
            nome sob acordo de tratamento.
          </P>
        </Secao>

        <Secao titulo="6. Armazenamento e segurança">
          <P>
            Os dados ficam armazenados no Supabase com controle de acesso por linha (RLS): cada
            usuário só acessa os próprios dados, e prestadores não aprovados não aparecem
            publicamente. Adotamos medidas técnicas para proteger as informações, mas nenhum
            sistema é 100% infalível.
          </P>
        </Secao>

        <Secao titulo="7. Seus direitos (art. 18 da LGPD)">
          <Item>Confirmar a existência de tratamento e acessar seus dados.</Item>
          <Item>Corrigir dados incompletos, inexatos ou desatualizados.</Item>
          <Item>Solicitar a exclusão da conta e dos dados tratados com consentimento.</Item>
          <Item>Solicitar a portabilidade dos seus dados.</Item>
          <Item>Revogar o consentimento e se opor a tratamentos.</Item>
        </Secao>

        <Secao titulo="8. Como exercer seus direitos">
          <P>
            Escreva para {CONTATO}. Responderemos no menor prazo possível. Você também pode
            excluir seu anúncio e sair da conta diretamente pelo app, na aba Perfil.
          </P>
        </Secao>

        <Secao titulo="9. Retenção e exclusão">
          <P>
            Mantemos seus dados enquanto sua conta existir ou enquanto forem necessários para as
            finalidades acima. Ao solicitar a exclusão, removemos seus dados pessoais, salvo
            obrigações legais de retenção.
          </P>
        </Secao>

        <Secao titulo="10. Alterações desta política">
          <P>
            Podemos atualizar esta política. Mudanças relevantes serão comunicadas no app. A data
            no topo indica a versão vigente.
          </P>
        </Secao>

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>Dúvidas sobre privacidade? {CONTATO}</Text>
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voltar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: glass.onGreen,
    borderWidth: 1,
    borderColor: glass.onGreenBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: {
    fontFamily: fonts.displayHeavy,
    fontSize: 20,
    color: colors.white,
    flex: 1,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.onGreen,
    marginTop: 12,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  atualizado: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.gray,
    marginBottom: 6,
  },
  secao: {
    marginTop: 18,
  },
  secaoTitulo: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  paragrafo: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.ink,
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.green,
  },
  itemTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.ink,
  },
  rodape: {
    marginTop: 26,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: glass.surface,
    borderWidth: 1,
    borderColor: glass.border,
  },
  rodapeTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
  },
});
