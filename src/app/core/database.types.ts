export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database["public"]["Enums"]["user_role"];
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_settings: {
        Row: {
          id: number;
          name: string;
          tagline: string;
          address: string;
          phone: string;
          hours: string;
          email: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          tagline?: string;
          address?: string;
          phone?: string;
          hours?: string;
          email?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          tagline?: string;
          address?: string;
          phone?: string;
          hours?: string;
          email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: Database["public"]["Enums"]["menu_category"];
          image_url: string;
          available: boolean;
          popular: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          category: Database["public"]["Enums"]["menu_category"];
          image_url?: string;
          available?: boolean;
          popular?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: Database["public"]["Enums"]["menu_category"];
          image_url?: string;
          available?: boolean;
          popular?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_email: string;
          phone: string;
          address: string;
          status: Database["public"]["Enums"]["order_status"];
          total: number;
          payment_method: Database["public"]["Enums"]["payment_method"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          customer_name: string;
          customer_email: string;
          phone?: string;
          address?: string;
          status?: Database["public"]["Enums"]["order_status"];
          total: number;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          phone?: string;
          address?: string;
          status?: Database["public"]["Enums"]["order_status"];
          total?: number;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          quantity: number;
          unit_price: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          name: string;
          quantity: number;
          unit_price: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string | null;
          name?: string;
          quantity?: number;
          unit_price?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: "cliente" | "admin" | "cocinero";
      order_status: "recibido" | "en_cocina" | "listo" | "entregado";
      menu_category:
        | "entradas"
        | "parrilla"
        | "acompanamientos"
        | "bebidas"
        | "postres";
      payment_method: "tarjeta" | "efectivo";
    };
    CompositeTypes: Record<string, never>;
  };
};
