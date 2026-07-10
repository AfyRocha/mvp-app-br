import { Image } from 'expo-image';

// Logo oficial (branco, fundo transparente) processado a partir da arte enviada.
const LOGO = require('../../assets/images/logo-achei-white.png');
const ASPECT = 1056 / 411; // proporção largura/altura da arte recortada

/** Logo da marca Achei: símbolo (A-pin com lupa) + wordmark, em branco. */
export function Logo({ size = 22 }: { size?: number }) {
  const height = Math.round(size * 1.55);
  return (
    <Image
      source={LOGO}
      style={{ height, width: Math.round(height * ASPECT) }}
      contentFit="contain"
      accessibilityLabel="Achei"
    />
  );
}
