// Auto-generated Supabase types — will be expanded as we define schema in Phase 1.

export interface Database {
    public: {
        Tables: {
            machines: {
                Row: {
                    id: string;
                    location: string;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    location: string;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    location?: string;
                    status?: string;
                    created_at?: string;
                };
            };
            inventory: {
                Row: {
                    id: string;
                    machine_id: string;
                    item_name: string;
                    price: number;
                    stock_count: number;
                    image_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    machine_id: string;
                    item_name: string;
                    price: number;
                    stock_count?: number;
                    image_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    machine_id?: string;
                    item_name?: string;
                    price?: number;
                    stock_count?: number;
                    image_url?: string | null;
                    created_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}
