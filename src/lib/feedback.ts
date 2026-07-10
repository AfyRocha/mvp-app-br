import { Alert, Platform } from 'react-native';

/**
 * Mensagens/confirmações cross-platform. O Alert do React Native é no-op na
 * web, então lá usamos window.alert/confirm. No nativo, usamos Alert normal.
 */

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirmAction(opts: {
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  const { title, message, confirmText = 'Confirmar', destructive, onConfirm } = opts;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ]);
  }
}
