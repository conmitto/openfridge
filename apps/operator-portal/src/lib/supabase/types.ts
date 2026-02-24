// Supabase Database types for OpenFridge

export interface Database {
    public: {
        Tables: {
            machines: {
                Row: {
                    id: string;
                    name: string;
                    location: string;
                    status: "active" | "inactive" | "maintenance";
                    owner_id: string | null;
                    image_url: string | null;
                    description: string | null;
                    lock_enabled: boolean;
                    lock_api_url: string | null;
                    lock_api_key: string | null;
                    lock_duration_sec: number;
                    ipad_placement: "on_door" | "countertop" | "mounted" | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    location: string;
                    status?: "active" | "inactive" | "maintenance";
                    owner_id?: string | null;
                    image_url?: string | null;
                    description?: string | null;
                    lock_enabled?: boolean;
                    lock_api_url?: string | null;
                    lock_api_key?: string | null;
                    lock_duration_sec?: number;
                    ipad_placement?: "on_door" | "countertop" | "mounted" | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    location?: string;
                    status?: "active" | "inactive" | "maintenance";
                    owner_id?: string | null;
                    image_url?: string | null;
                    description?: string | null;
                    lock_enabled?: boolean;
                    lock_api_url?: string | null;
                    lock_api_key?: string | null;
                    lock_duration_sec?: number;
                    ipad_placement?: "on_door" | "countertop" | "mounted" | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            inventory: {
                Row: {
                    id: string;
                    machine_id: string;
                    item_name: string;
                    price: number;
                    purchase_price: number | null;
                    stock_count: number;
                    image_url: string | null;
                    description: string | null;
                    reorder_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    machine_id: string;
                    item_name: string;
                    price: number;
                    purchase_price?: number | null;
                    stock_count?: number;
                    image_url?: string | null;
                    description?: string | null;
                    reorder_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    machine_id?: string;
                    item_name?: string;
                    price?: number;
                    purchase_price?: number | null;
                    stock_count?: number;
                    image_url?: string | null;
                    description?: string | null;
                    reorder_url?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "inventory_machine_id_fkey";
                        columns: ["machine_id"];
                        isOneToOne: false;
                        referencedRelation: "machines";
                        referencedColumns: ["id"];
                    }
                ];
            };
            sales: {
                Row: {
                    id: string;
                    machine_id: string;
                    inventory_id: string | null;
                    item_name: string;
                    quantity: number;
                    total_price: number;
                    payment_method: "card" | "apple_pay" | "crypto";
                    sold_at: string;
                };
                Insert: {
                    id?: string;
                    machine_id: string;
                    inventory_id?: string | null;
                    item_name: string;
                    quantity?: number;
                    total_price: number;
                    payment_method?: "card" | "apple_pay" | "crypto";
                    sold_at?: string;
                };
                Update: {
                    id?: string;
                    machine_id?: string;
                    inventory_id?: string | null;
                    item_name?: string;
                    quantity?: number;
                    total_price?: number;
                    payment_method?: "card" | "apple_pay" | "crypto";
                    sold_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "sales_machine_id_fkey";
                        columns: ["machine_id"];
                        isOneToOne: false;
                        referencedRelation: "machines";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sales_inventory_id_fkey";
                        columns: ["inventory_id"];
                        isOneToOne: false;
                        referencedRelation: "inventory";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    company_name: string | null;
                    avatar_url: string | null;
                    onboarded: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    company_name?: string | null;
                    avatar_url?: string | null;
                    onboarded?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    company_name?: string | null;
                    avatar_url?: string | null;
                    onboarded?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            door_access_logs: {
                Row: {
                    id: string;
                    machine_id: string;
                    payment_intent_id: string | null;
                    trigger: "purchase" | "manual";
                    opened_at: string;
                };
                Insert: {
                    id?: string;
                    machine_id: string;
                    payment_intent_id?: string | null;
                    trigger?: "purchase" | "manual";
                    opened_at?: string;
                };
                Update: {
                    id?: string;
                    machine_id?: string;
                    payment_intent_id?: string | null;
                    trigger?: "purchase" | "manual";
                    opened_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "door_access_logs_machine_id_fkey";
                        columns: ["machine_id"];
                        isOneToOne: false;
                        referencedRelation: "machines";
                        referencedColumns: ["id"];
                    }
                ];
            };
            api_keys: {
                Row: {
                    id: string;
                    user_id: string;
                    provider: "openai" | "anthropic";
                    api_key: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    provider: "openai" | "anthropic";
                    api_key: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    provider?: "openai" | "anthropic";
                    api_key?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Convenience type aliases
export type Machine = Database["public"]["Tables"]["machines"]["Row"];
export type MachineInsert = Database["public"]["Tables"]["machines"]["Insert"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
export type InventoryInsert = Database["public"]["Tables"]["inventory"]["Insert"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type DoorAccessLog = Database["public"]["Tables"]["door_access_logs"]["Row"];
export type DoorAccessLogInsert = Database["public"]["Tables"]["door_access_logs"]["Insert"];
export type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"];
export type ApiKeyInsert = Database["public"]["Tables"]["api_keys"]["Insert"];
