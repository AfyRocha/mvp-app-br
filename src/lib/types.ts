export type CategorySlug =
  | 'limpeza'
  | 'reforma'
  | 'taxes'
  | 'beleza'
  | 'foto'
  | 'comida'
  | 'transporte'
  | 'imigracao';

export interface Category {
  id: string;
  slug: CategorySlug;
  nome: string;
  icone: string;
}

export interface Profile {
  id: string;
  nome: string | null;
  tipo: 'cliente' | 'prestador';
  telefone: string | null;
  cidade: string | null;
  endereco: string | null;
  foto_url: string | null;
  criado_em: string;
}

export interface Provider {
  id: string;
  profile_id: string | null;
  nome_negocio: string;
  categoria: CategorySlug;
  bio: string | null;
  cidade_principal: string;
  cidades_atendidas: string[];
  whatsapp: string;
  servicos: string[];
  cor: string | null;
  verificado: boolean;
  plano: 'free' | 'destaque';
  desde: number | null;
  aprovado: boolean;
  visualizacoes: number;
  criado_em: string;
}

/** Linha da view `providers_com_nota` — fonte da listagem pública. */
export interface ProviderWithRating extends Provider {
  nota_media: number | null;
  total_avaliacoes: number;
  categoria_nome: string;
}

export interface ProviderPhoto {
  id: string;
  provider_id: string;
  url: string;
  ordem: number;
}

export interface Review {
  id: string;
  provider_id: string;
  autor_profile_id: string;
  nota: number;
  texto: string | null;
  criado_em: string;
  autor_nome?: string | null;
}
