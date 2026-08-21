export type MenuCategory =
  | 'entradas'
  | 'parrilla'
  | 'acompanamientos'
  | 'bebidas'
  | 'postres';

export type OrderStatus =
  | 'recibido'
  | 'en_cocina'
  | 'listo'
  | 'entregado';

export type UserRole = 'cliente' | 'admin' | 'cocinero';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
  popular?: boolean;
  sortOrder?: number;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
}

export interface OrderItem {
  id?: string;
  menuItemId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  paymentMethod: 'tarjeta' | 'efectivo';
  createdAt: string;
  notes?: string | null;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  hours: string;
  email: string;
}

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  entradas: 'Entradas',
  parrilla: 'Parrilla',
  acompanamientos: 'Acompañamientos',
  bebidas: 'Bebidas',
  postres: 'Postres',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  recibido: 'Recibido',
  en_cocina: 'En cocina',
  listo: 'Listo',
  entregado: 'Entregado',
};

export const KANBAN_COLUMNS: OrderStatus[] = [
  'recibido',
  'en_cocina',
  'listo',
  'entregado',
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
