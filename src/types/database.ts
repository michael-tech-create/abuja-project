export type UserRole = "tenant" | "landlord" | "agent" | "admin";

export type KycStatus = "unsubmitted" | "pending" | "verified" | "rejected";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type PropertyType =
  | "apartment"
  | "estate_house"
  | "duplex"
  | "bungalow"
  | "studio"
  | "commercial"
  | "land"
  | "other";

export type AbujaDistrict =
  | "maitama"
  | "asokoro"
  | "wuse"
  | "wuse_2"
  | "garki"
  | "gwarinpa"
  | "jabi"
  | "utako"
  | "kubwa"
  | "lugbe"
  | "katampe"
  | "lifecamp"
  | "lokogoma"
  | "apo"
  | "durumi"
  | "gudu"
  | "mpape"
  | "kado"
  | "jahi"
  | "other";

export type DocumentType =
  | "nin"
  | "certificate_of_occupancy"
  | "deed_of_assignment"
  | "agency_licence"
  | "utility_bill"
  | "property_photo_proof"
  | "other";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  bio: string | null;
  kyc_status: KycStatus;
  is_active: boolean;
  onboarding_completed: boolean;
  nin_number: string | null;
  nin_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  district: AbujaDistrict;
  address_line: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  amenities: string[];
  images: string[];
  videos: string[];
  building_name: string | null;
  is_multi_unit: boolean;
  verification_status: VerificationStatus;
  is_verified: boolean;
  is_published: boolean;
  rejection_reason: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyUnit = {
  id: string;
  property_id: string;
  label: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  price: number;
  currency: string;
  amenities: string[];
  images: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type VerificationDocument = {
  id: string;
  user_id: string;
  property_id: string | null;
  doc_type: DocumentType;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  status: VerificationStatus;
  reviewer_id: string | null;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  last_message_at: string | null;
  created_at: string;
};

export type MessageMediaType = "none" | "image" | "video";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  media_type: MessageMediaType;
  media_mime: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type AdminAction = {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  notes: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          bio?: string | null;
          kyc_status?: KycStatus;
          is_active?: boolean;
          onboarding_completed?: boolean;
          nin_number?: string | null;
          nin_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      properties: {
        Row: Property;
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          property_type: PropertyType;
          district: AbujaDistrict;
          address_line?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price: number;
          currency?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: number | null;
          amenities?: string[];
          images?: string[];
          videos?: string[];
          building_name?: string | null;
          is_multi_unit?: boolean;
          verification_status?: VerificationStatus;
          is_published?: boolean;
          rejection_reason?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Property, "is_verified" | "id">>;
        Relationships: [];
      };
      property_units: {
        Row: PropertyUnit;
        Insert: {
          id?: string;
          property_id: string;
          label: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: number | null;
          price: number;
          currency?: string;
          amenities?: string[];
          images?: string[];
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<PropertyUnit>;
        Relationships: [];
      };
      verification_documents: {
        Row: VerificationDocument;
        Insert: {
          id?: string;
          user_id: string;
          property_id?: string | null;
          doc_type: DocumentType;
          storage_path: string;
          file_name?: string | null;
          mime_type?: string | null;
          status?: VerificationStatus;
          reviewer_id?: string | null;
          review_notes?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<VerificationDocument>;
        Relationships: [];
      };
      favorites: {
        Row: Favorite;
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Favorite>;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Review>;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "last_message_at"> & {
          id?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Conversation>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string;
          media_url?: string | null;
          media_type?: MessageMediaType;
          media_mime?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Message>;
        Relationships: [];
      };
      admin_actions: {
        Row: AdminAction;
        Insert: Omit<AdminAction, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AdminAction>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      claim_signup_role: {
        Args: { desired_role: UserRole };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      kyc_status: KycStatus;
      verification_status: VerificationStatus;
      property_type: PropertyType;
      abuja_district: AbujaDistrict;
      document_type: DocumentType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export const ABUJA_DISTRICTS: { value: AbujaDistrict; label: string }[] = [
  { value: "maitama", label: "Maitama" },
  { value: "asokoro", label: "Asokoro" },
  { value: "wuse", label: "Wuse" },
  { value: "wuse_2", label: "Wuse II" },
  { value: "garki", label: "Garki" },
  { value: "gwarinpa", label: "Gwarinpa" },
  { value: "jabi", label: "Jabi" },
  { value: "utako", label: "Utako" },
  { value: "kubwa", label: "Kubwa" },
  { value: "lugbe", label: "Lugbe" },
  { value: "katampe", label: "Katampe" },
  { value: "lifecamp", label: "Life Camp" },
  { value: "lokogoma", label: "Lokogoma" },
  { value: "apo", label: "Apo" },
  { value: "durumi", label: "Durumi" },
  { value: "gudu", label: "Gudu" },
  { value: "mpape", label: "Mpape" },
  { value: "kado", label: "Kado" },
  { value: "jahi", label: "Jahi" },
  { value: "other", label: "Other" },
];

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "estate_house", label: "Estate House" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];
