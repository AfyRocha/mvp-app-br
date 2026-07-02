import {
  Calculator,
  Camera,
  FileCheck2,
  Hammer,
  Scissors,
  Sparkles,
  Tag,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';

/** Mapeia o campo `icone` da tabela categories para o ícone lucide. */
const ICONES: Record<string, LucideIcon> = {
  'sparkles': Sparkles,
  'hammer': Hammer,
  'calculator': Calculator,
  'scissors': Scissors,
  'camera': Camera,
  'utensils-crossed': UtensilsCrossed,
  'truck': Truck,
  'file-check-2': FileCheck2,
};

export function CategoryIcon({
  icone,
  size = 14,
  color,
  strokeWidth = 2.2,
}: {
  icone: string;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const Icone = ICONES[icone] ?? Tag;
  return <Icone size={size} color={color} strokeWidth={strokeWidth} />;
}
