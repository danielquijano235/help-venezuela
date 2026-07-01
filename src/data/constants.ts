import {
  Pill,
  Droplet,
  UtensilsCrossed,
  Baby,
  ShowerHead,
  Shirt,
  PawPrint,
  Package,
  ShieldAlert,
  Stethoscope,
  Brain,
  Scale,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type { Estado, TipoDonacion } from '../types/centro';
import type { CategoriaServicio } from '../types/servicioAyuda';

export const CIUDADES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Cúcuta',
  'Barranquilla',
  'Bucaramanga',
  'Valledupar',
] as const;

export const TIPOS_DONACION: { value: TipoDonacion; label: string; icon: LucideIcon }[] = [
  { value: 'medicina', label: 'Medicina', icon: Pill },
  { value: 'agua', label: 'Agua', icon: Droplet },
  { value: 'comida', label: 'Comida', icon: UtensilsCrossed },
  { value: 'panales', label: 'Pañales', icon: Baby },
  { value: 'higiene', label: 'Higiene', icon: ShowerHead },
  { value: 'ropa', label: 'Ropa', icon: Shirt },
  { value: 'mascotas', label: 'Mascotas', icon: PawPrint },
  { value: 'otros', label: 'Otros', icon: Package },
];

export const ESTADOS: { value: Estado; label: string; className: string }[] = [
  { value: 'urgente', label: 'Urgente', className: 'border border-signal bg-signal text-paper' },
  { value: 'activo', label: 'Activo', className: 'border border-moss bg-moss text-paper' },
  { value: 'cerrado', label: 'Cerrado', className: 'border border-ink/20 bg-ink/5 text-ink/60' },
];

export const CATEGORIAS_SERVICIO: { value: CategoriaServicio; label: string; icon: LucideIcon }[] = [
  { value: 'emergencia', label: 'Emergencia', icon: ShieldAlert },
  { value: 'medico', label: 'Médico', icon: Stethoscope },
  { value: 'psicosocial', label: 'Psicosocial', icon: Brain },
  { value: 'legal', label: 'Legal', icon: Scale },
  { value: 'refugio', label: 'Refugio', icon: Home },
  { value: 'otros', label: 'Otros', icon: Package },
];
