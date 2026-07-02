import { supabase } from '@/lib/supabase';
import type {
  Category,
  Provider,
  ProviderPhoto,
  ProviderWithRating,
  Review,
} from '@/lib/types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('nome');
  if (error) throw error;
  return (data as Category[]) ?? [];
}

/**
 * Listagem pública: só aprovados (garantido pela RLS + view),
 * plano destaque primeiro, depois melhor nota.
 * A lista do MVP é pequena; busca por texto/cidade é filtrada no cliente.
 */
export async function fetchProviders(): Promise<ProviderWithRating[]> {
  const { data, error } = await supabase
    .from('providers_com_nota')
    .select('*')
    .eq('aprovado', true)
    .limit(200);
  if (error) throw error;

  const rows = (data as ProviderWithRating[]) ?? [];
  return rows.sort((a, b) => {
    if (a.plano !== b.plano) return a.plano === 'destaque' ? -1 : 1;
    return (b.nota_media ?? 0) - (a.nota_media ?? 0);
  });
}

export async function fetchProviderById(id: string): Promise<ProviderWithRating | null> {
  const { data, error } = await supabase
    .from('providers_com_nota')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as ProviderWithRating | null) ?? null;
}

export async function fetchProviderPhotos(providerId: string): Promise<ProviderPhoto[]> {
  const { data, error } = await supabase
    .from('provider_photos')
    .select('*')
    .eq('provider_id', providerId)
    .order('ordem');
  if (error) throw error;
  return (data as ProviderPhoto[]) ?? [];
}

export async function fetchReviews(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews_com_autor')
    .select('*')
    .eq('provider_id', providerId)
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data as Review[]) ?? [];
}

export async function submitReview(input: {
  provider_id: string;
  autor_profile_id: string;
  nota: number;
  texto: string;
}) {
  const { error } = await supabase
    .from('reviews')
    .upsert(input, { onConflict: 'provider_id,autor_profile_id' });
  if (error) throw error;
}

/** Dispara e esquece: não bloqueia a abertura do perfil. */
export function incrementProviderView(providerId: string) {
  supabase
    .rpc('incrementar_visualizacao', { p_provider_id: providerId })
    .then(({ error }) => {
      if (error) console.warn('Falha ao registrar visualização:', error.message);
    });
}

export async function fetchMyProvider(profileId: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) throw error;
  return (data as Provider | null) ?? null;
}

export async function createProvider(input: {
  profile_id: string;
  nome_negocio: string;
  categoria: string;
  bio: string;
  cidade_principal: string;
  cidades_atendidas: string[];
  whatsapp: string;
}): Promise<Provider> {
  const { data, error } = await supabase
    .from('providers')
    .insert({ ...input, aprovado: false })
    .select('*')
    .single();
  if (error) throw error;
  return data as Provider;
}

export async function updateProvider(
  id: string,
  patch: Partial<
    Pick<
      Provider,
      'nome_negocio' | 'categoria' | 'bio' | 'cidade_principal' | 'cidades_atendidas' | 'whatsapp'
    >
  >
) {
  const { error } = await supabase.from('providers').update(patch).eq('id', id);
  if (error) throw error;
}

export async function addProviderPhoto(providerId: string, url: string, ordem: number) {
  const { error } = await supabase
    .from('provider_photos')
    .insert({ provider_id: providerId, url, ordem });
  if (error) throw error;
}

/** Sobe uma foto para o Storage e devolve a URL pública. */
export async function uploadProviderPhoto(
  userId: string,
  localUri: string,
  index: number
): Promise<string> {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}-${index}.${ext}`;

  const { error } = await supabase.storage
    .from('provider-photos')
    .upload(path, arrayBuffer, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
  if (error) throw error;

  return supabase.storage.from('provider-photos').getPublicUrl(path).data.publicUrl;
}
