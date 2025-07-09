export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      biddings: {
        Row: {
          amparo_legal_codigo: number | null
          amparo_legal_descricao: string | null
          amparo_legal_nome: string | null
          ano_compra: number | null
          arquivos: Json | null
          created_at: string | null
          data_abertura_proposta: string | null
          data_atualizacao: string | null
          data_atualizacao_global: string | null
          data_encerramento_proposta: string | null
          data_extracao: string | null
          data_inclusao: string | null
          data_publicacao_pncp: string | null
          existe_resultado: boolean | null
          external_id: string
          id: string
          informacao_complementar: string | null
          justificativa_presencial: string | null
          link_processo_eletronico: string | null
          link_sistema_origem: string | null
          modalidade_id: number | null
          modalidade_nome: string | null
          modo_disputa_id: number | null
          modo_disputa_nome: string | null
          numero_compra: string | null
          numero_controle_pncp: string | null
          objeto_compra: string
          orcamento_sigiloso_codigo: number | null
          orcamento_sigiloso_descricao: string | null
          orgao_cnpj: string | null
          orgao_esfera_id: string | null
          orgao_poder_id: string | null
          orgao_razao_social: string | null
          processo: string | null
          sequencial_compra: number | null
          situacao_compra_id: number | null
          situacao_compra_nome: string | null
          srp: boolean | null
          status: string
          tipo_instrumento_codigo: number | null
          tipo_instrumento_nome: string | null
          unidade_codigo_ibge: string | null
          unidade_codigo_unidade: string | null
          unidade_municipio_nome: string | null
          unidade_nome_unidade: string | null
          unidade_uf_nome: string | null
          unidade_uf_sigla: string | null
          updated_at: string | null
          usuario_nome: string | null
          valor_total_estimado: number | null
          valor_total_homologado: number | null
        }
        Insert: {
          amparo_legal_codigo?: number | null
          amparo_legal_descricao?: string | null
          amparo_legal_nome?: string | null
          ano_compra?: number | null
          arquivos?: Json | null
          created_at?: string | null
          data_abertura_proposta?: string | null
          data_atualizacao?: string | null
          data_atualizacao_global?: string | null
          data_encerramento_proposta?: string | null
          data_extracao?: string | null
          data_inclusao?: string | null
          data_publicacao_pncp?: string | null
          existe_resultado?: boolean | null
          external_id: string
          id?: string
          informacao_complementar?: string | null
          justificativa_presencial?: string | null
          link_processo_eletronico?: string | null
          link_sistema_origem?: string | null
          modalidade_id?: number | null
          modalidade_nome?: string | null
          modo_disputa_id?: number | null
          modo_disputa_nome?: string | null
          numero_compra?: string | null
          numero_controle_pncp?: string | null
          objeto_compra: string
          orcamento_sigiloso_codigo?: number | null
          orcamento_sigiloso_descricao?: string | null
          orgao_cnpj?: string | null
          orgao_esfera_id?: string | null
          orgao_poder_id?: string | null
          orgao_razao_social?: string | null
          processo?: string | null
          sequencial_compra?: number | null
          situacao_compra_id?: number | null
          situacao_compra_nome?: string | null
          srp?: boolean | null
          status?: string
          tipo_instrumento_codigo?: number | null
          tipo_instrumento_nome?: string | null
          unidade_codigo_ibge?: string | null
          unidade_codigo_unidade?: string | null
          unidade_municipio_nome?: string | null
          unidade_nome_unidade?: string | null
          unidade_uf_nome?: string | null
          unidade_uf_sigla?: string | null
          updated_at?: string | null
          usuario_nome?: string | null
          valor_total_estimado?: number | null
          valor_total_homologado?: number | null
        }
        Update: {
          amparo_legal_codigo?: number | null
          amparo_legal_descricao?: string | null
          amparo_legal_nome?: string | null
          ano_compra?: number | null
          arquivos?: Json | null
          created_at?: string | null
          data_abertura_proposta?: string | null
          data_atualizacao?: string | null
          data_atualizacao_global?: string | null
          data_encerramento_proposta?: string | null
          data_extracao?: string | null
          data_inclusao?: string | null
          data_publicacao_pncp?: string | null
          existe_resultado?: boolean | null
          external_id?: string
          id?: string
          informacao_complementar?: string | null
          justificativa_presencial?: string | null
          link_processo_eletronico?: string | null
          link_sistema_origem?: string | null
          modalidade_id?: number | null
          modalidade_nome?: string | null
          modo_disputa_id?: number | null
          modo_disputa_nome?: string | null
          numero_compra?: string | null
          numero_controle_pncp?: string | null
          objeto_compra?: string
          orcamento_sigiloso_codigo?: number | null
          orcamento_sigiloso_descricao?: string | null
          orgao_cnpj?: string | null
          orgao_esfera_id?: string | null
          orgao_poder_id?: string | null
          orgao_razao_social?: string | null
          processo?: string | null
          sequencial_compra?: number | null
          situacao_compra_id?: number | null
          situacao_compra_nome?: string | null
          srp?: boolean | null
          status?: string
          tipo_instrumento_codigo?: number | null
          tipo_instrumento_nome?: string | null
          unidade_codigo_ibge?: string | null
          unidade_codigo_unidade?: string | null
          unidade_municipio_nome?: string | null
          unidade_nome_unidade?: string | null
          unidade_uf_nome?: string | null
          unidade_uf_sigla?: string | null
          updated_at?: string | null
          usuario_nome?: string | null
          valor_total_estimado?: number | null
          valor_total_homologado?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          bidding_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          bidding_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          bidding_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_bidding_id_fkey"
            columns: ["bidding_id"]
            isOneToOne: false
            referencedRelation: "biddings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          cities: string[] | null
          created_at: string | null
          end_date: string | null
          id: string
          keywords: string | null
          modalities: string[] | null
          name: string
          smart_search: boolean | null
          start_date: string | null
          states: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cities?: string[] | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          keywords?: string | null
          modalities?: string[] | null
          name: string
          smart_search?: boolean | null
          start_date?: string | null
          states?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cities?: string[] | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          keywords?: string | null
          modalities?: string[] | null
          name?: string
          smart_search?: boolean | null
          start_date?: string | null
          states?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
