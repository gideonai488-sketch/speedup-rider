export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ambassador_applications: {
        Row: {
          country: string
          created_at: string
          email: string
          follower_count: string | null
          full_name: string
          id: string
          major: string | null
          phone: string
          referral_code: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media_handle: string | null
          status: string
          student_id_number: string | null
          university_city: string
          university_name: string
          updated_at: string
          why_ambassador: string
          year_of_study: string
        }
        Insert: {
          country?: string
          created_at?: string
          email: string
          follower_count?: string | null
          full_name: string
          id?: string
          major?: string | null
          phone: string
          referral_code?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_handle?: string | null
          status?: string
          student_id_number?: string | null
          university_city: string
          university_name: string
          updated_at?: string
          why_ambassador: string
          year_of_study: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          follower_count?: string | null
          full_name?: string
          id?: string
          major?: string | null
          phone?: string
          referral_code?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_handle?: string | null
          status?: string
          student_id_number?: string | null
          university_city?: string
          university_name?: string
          updated_at?: string
          why_ambassador?: string
          year_of_study?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_earning_rates: {
        Row: {
          country_code: string
          created_at: string
          currency_symbol: string
          description: string | null
          first_order_bonus: number
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          currency_symbol: string
          description?: string | null
          first_order_bonus?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          currency_symbol?: string
          description?: string | null
          first_order_bonus?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ambassador_payout_cycles: {
        Row: {
          created_at: string | null
          cycle_end_date: string
          cycle_start_date: string
          id: string
          processed_at: string | null
          status: string | null
          total_ambassadors_paid: number | null
          total_amount_paid: number | null
        }
        Insert: {
          created_at?: string | null
          cycle_end_date: string
          cycle_start_date: string
          id?: string
          processed_at?: string | null
          status?: string | null
          total_ambassadors_paid?: number | null
          total_amount_paid?: number | null
        }
        Update: {
          created_at?: string | null
          cycle_end_date?: string
          cycle_start_date?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          total_ambassadors_paid?: number | null
          total_amount_paid?: number | null
        }
        Relationships: []
      }
      ambassador_signups: {
        Row: {
          ambassador_id: string
          biweekly_last_paid_at: string | null
          biweekly_next_due_at: string | null
          bonus_earned: number | null
          created_at: string
          first_order_id: string | null
          first_order_paid: boolean | null
          id: string
          paid_at: string | null
          referral_code: string
          signed_up_user_id: string
          status: string
        }
        Insert: {
          ambassador_id: string
          biweekly_last_paid_at?: string | null
          biweekly_next_due_at?: string | null
          bonus_earned?: number | null
          created_at?: string
          first_order_id?: string | null
          first_order_paid?: boolean | null
          id?: string
          paid_at?: string | null
          referral_code: string
          signed_up_user_id: string
          status?: string
        }
        Update: {
          ambassador_id?: string
          biweekly_last_paid_at?: string | null
          biweekly_next_due_at?: string | null
          bonus_earned?: number | null
          created_at?: string
          first_order_id?: string | null
          first_order_paid?: boolean | null
          id?: string
          paid_at?: string | null
          referral_code?: string
          signed_up_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_signups_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_signups_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_signups_first_order_id_fkey"
            columns: ["first_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_signups_signed_up_user_id_fkey"
            columns: ["signed_up_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_signups_signed_up_user_id_fkey"
            columns: ["signed_up_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_stats: {
        Row: {
          ambassador_id: string
          current_month_earnings: number
          current_month_signups: number
          id: string
          rank: number | null
          total_earnings: number
          total_orders_generated: number
          total_signups: number
          updated_at: string
        }
        Insert: {
          ambassador_id: string
          current_month_earnings?: number
          current_month_signups?: number
          id?: string
          rank?: number | null
          total_earnings?: number
          total_orders_generated?: number
          total_signups?: number
          updated_at?: string
        }
        Update: {
          ambassador_id?: string
          current_month_earnings?: number
          current_month_signups?: number
          id?: string
          rank?: number | null
          total_earnings?: number
          total_orders_generated?: number
          total_signups?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_stats_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_stats_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          created_at: string
          id: string
          message: string | null
          order_id: string
          rider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          message?: string | null
          order_id: string
          rider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          order_id?: string
          rider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          message_template: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_audience: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message_template: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message_template?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          order_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          base_fee: number | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivery_address: string
          delivery_fee: number
          delivery_lat: number | null
          delivery_lng: number | null
          distance_km: number | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_number: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          per_km_fee: number | null
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          rider_fee: number | null
          rider_id: string | null
          scheduled_at: string | null
          service_fee: number | null
          status: Database["public"]["Enums"]["order_status"]
          store_id: string | null
          subtotal: number
          surge_multiplier: number | null
          total: number
          updated_at: string
        }
        Insert: {
          base_fee?: number | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_address: string
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          distance_km?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          per_km_fee?: number | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          rider_fee?: number | null
          rider_id?: string | null
          scheduled_at?: string | null
          service_fee?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          subtotal?: number
          surge_multiplier?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          base_fee?: number | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          distance_km?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          per_km_fee?: number | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          rider_fee?: number | null
          rider_id?: string | null
          scheduled_at?: string | null
          service_fee?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          subtotal?: number
          surge_multiplier?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_requests: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          is_verified: boolean
          max_attempts: number
          otp_code: string
          phone: string
          purpose: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          is_verified?: boolean
          max_attempts?: number
          otp_code: string
          phone: string
          purpose?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          is_verified?: boolean
          max_attempts?: number
          otp_code?: string
          phone?: string
          purpose?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otp_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otp_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          business_address: string
          business_name: string
          business_type: string
          city: string
          contact_name: string
          created_at: string
          description: string | null
          email: string | null
          estimated_daily_orders: string | null
          id: string
          logo_url: string | null
          notes: string | null
          operating_hours: string | null
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          business_address: string
          business_name: string
          business_type: string
          city: string
          contact_name: string
          created_at?: string
          description?: string | null
          email?: string | null
          estimated_daily_orders?: string | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          operating_hours?: string | null
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          business_address?: string
          business_name?: string
          business_type?: string
          city?: string
          contact_name?: string
          created_at?: string
          description?: string | null
          email?: string | null
          estimated_daily_orders?: string | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          operating_hours?: string | null
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_idempotency: {
        Row: {
          id: string
          order_id: string | null
          payment_reference: string
          processed_at: string
          result: Json | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          payment_reference: string
          processed_at?: string
          result?: Json | null
        }
        Update: {
          id?: string
          order_id?: string | null
          payment_reference?: string
          processed_at?: string
          result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_idempotency_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          rating: number | null
          reviews_count: number | null
          store_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          rating?: number | null
          reviews_count?: number | null
          store_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          reviews_count?: number | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_name: string | null
          account_number: string | null
          address: string | null
          avatar_url: string | null
          bank_code: string | null
          bank_name: string | null
          city: string | null
          country_code: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          rider_status: string | null
          role: Database["public"]["Enums"]["user_role"]
          subaccount_code: string | null
          university: string | null
          updated_at: string
          user_id: string
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bank_code?: string | null
          bank_name?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          rider_status?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subaccount_code?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bank_code?: string | null
          bank_name?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          rider_status?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subaccount_code?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          rider_id: string | null
          rider_rating: number | null
          store_id: string | null
          store_rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          rider_id?: string | null
          rider_rating?: number | null
          store_id?: string | null
          store_rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          rider_id?: string | null
          rider_rating?: number | null
          store_id?: string | null
          store_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_amount: number | null
          created_at: string
          id: string
          is_used: boolean | null
          referral_code: string
          referred_id: string | null
          referrer_id: string
          used_at: string | null
        }
        Insert: {
          bonus_amount?: number | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          used_at?: string | null
        }
        Update: {
          bonus_amount?: number | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_locations: {
        Row: {
          heading: number | null
          id: string
          is_online: boolean | null
          latitude: number
          longitude: number
          rider_id: string
          speed: number | null
          updated_at: string
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          heading?: number | null
          id?: string
          is_online?: boolean | null
          latitude: number
          longitude: number
          rider_id: string
          speed?: number | null
          updated_at?: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          heading?: number | null
          id?: string
          is_online?: boolean | null
          latitude?: number
          longitude?: number
          rider_id?: string
          speed?: number | null
          updated_at?: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rider_locations_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rider_locations_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["store_category"]
          city: string | null
          cover_color: string | null
          cover_image_url: string | null
          created_at: string
          delivery_fee: number | null
          delivery_time: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          min_order: number | null
          name: string
          opening_hours: string | null
          owner_id: string | null
          rating: number | null
          reviews_count: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["store_category"]
          city?: string | null
          cover_color?: string | null
          cover_image_url?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          min_order?: number | null
          name: string
          opening_hours?: string | null
          owner_id?: string | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["store_category"]
          city?: string | null
          cover_color?: string | null
          cover_image_url?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          min_order?: number | null
          name?: string
          opening_hours?: string | null
          owner_id?: string | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          api_key_reference: string | null
          created_at: string
          id: string
          is_active: boolean
          provider: string
          sender_id: string | null
          settings: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key_reference?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          sender_id?: string | null
          settings?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key_reference?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          sender_id?: string | null
          settings?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank_code: string
          bank_name: string
          created_at: string
          failure_reason: string | null
          id: string
          paystack_reference: string | null
          paystack_transfer_code: string | null
          processed_at: string | null
          rider_id: string
          status: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank_code: string
          bank_name: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          paystack_reference?: string | null
          paystack_transfer_code?: string | null
          processed_at?: string | null
          rider_id: string
          status?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank_code?: string
          bank_name?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          paystack_reference?: string | null
          paystack_transfer_code?: string | null
          processed_at?: string | null
          rider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          vehicle_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          vehicle_type?: never
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          vehicle_type?: never
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_delivery_fee:
        | {
            Args: {
              p_base_fee?: number
              p_distance_km: number
              p_per_km_fee?: number
              p_surge_multiplier?: number
            }
            Returns: number
          }
        | {
            Args: {
              p_base_fee?: number
              p_distance_km: number
              p_per_km_fee?: number
              p_service_fee?: number
              p_surge_multiplier?: number
            }
            Returns: number
          }
      get_profile_id: { Args: { check_user_id: string }; Returns: string }
      get_surge_multiplier: { Args: never; Returns: number }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_admin_no_rls: { Args: { check_user_id: string }; Returns: boolean }
      is_rider: { Args: { check_user_id: string }; Returns: boolean }
      run_ambassador_biweekly_payouts: { Args: never; Returns: undefined }
      validate_order_payment: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: {
          error_message: string
          is_valid: boolean
          order_data: Json
        }[]
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready_for_pickup"
        | "picked_up"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      store_category: "food" | "groceries" | "electronics" | "pharmacy"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "order_payment"
        | "order_refund"
        | "rider_earning"
        | "referral_bonus"
      user_role: "customer" | "rider" | "admin" | "ambassador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      store_category: ["food", "groceries", "electronics", "pharmacy"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "order_payment",
        "order_refund",
        "rider_earning",
        "referral_bonus",
      ],
      user_role: ["customer", "rider", "admin", "ambassador"],
    },
  },
} as const
