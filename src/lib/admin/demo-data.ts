import { DEMO_PUBLIC_PROPERTIES } from "@/lib/properties/demo-data";
import type {
  AdminAction,
  Profile,
  Property,
  VerificationDocument,
} from "@/types/database";

const now = Date.now();

export const DEMO_PENDING_PROPERTIES: Property[] = [
  {
    id: "demo-pending-1",
    owner_id: "demo-lister-1",
    title: "4-bed duplex awaiting verification — Asokoro",
    description:
      "Newly finished duplex with BQ, solar inverter, and estate security. Submitted for admin review with C of O and exterior proof photos.",
    property_type: "duplex",
    district: "asokoro",
    address_line: "Yahaya Abubakar Road",
    latitude: 9.043,
    longitude: 7.515,
    price: 18000000,
    currency: "NGN",
    bedrooms: 4,
    bathrooms: 5,
    area_sqm: 360,
    amenities: ["parking", "generator", "security", "bq", "inverter"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    ],
    videos: [],
    building_name: null,
    is_multi_unit: false,
    verification_status: "pending",
    is_verified: false,
    is_published: false,
    rejection_reason: null,
    verified_at: null,
    verified_by: null,
    created_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "demo-pending-2",
    owner_id: "demo-lister-2",
    title: "Commercial plaza unit — Wuse",
    description:
      "Ground-floor commercial unit near Wuse market. Owner submitted agency licence and utility bill for KYC, plus listing photos.",
    property_type: "commercial",
    district: "wuse",
    address_line: "Aminu Kano Crescent",
    latitude: 9.064,
    longitude: 7.47,
    price: 9500000,
    currency: "NGN",
    bedrooms: null,
    bathrooms: 2,
    area_sqm: 95,
    amenities: ["parking", "generator", "cctv"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    ],
    videos: [],
    building_name: null,
    is_multi_unit: false,
    verification_status: "pending",
    is_verified: false,
    is_published: false,
    rejection_reason: null,
    verified_at: null,
    verified_by: null,
    created_at: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
  },
];

export const DEMO_KYC_PROFILES: Profile[] = [
  {
    id: "demo-lister-1",
    role: "landlord",
    full_name: "Ibrahim Bello",
    email: "ibrahim@bello-homes.demo",
    phone: "+2348011112233",
    avatar_url: null,
    company_name: "Bello Homes",
    bio: "Asokoro and Maitama landlord.",
    kyc_status: "pending",
    is_active: true,
    onboarding_completed: true,
    nin_number: null,
    nin_verified_at: null,
    created_at: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "demo-lister-2",
    role: "agent",
    full_name: "Ngozi Eze",
    email: "ngozi@capitalagency.demo",
    phone: "+2348099988776",
    avatar_url: null,
    company_name: "Capital Homes Agency",
    bio: "Licensed Abuja lettings agent.",
    kyc_status: "pending",
    is_active: true,
    onboarding_completed: true,
    nin_number: null,
    nin_verified_at: null,
    created_at: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
  },
];

export const DEMO_VERIFICATION_DOCUMENTS: VerificationDocument[] = [
  {
    id: "demo-doc-1",
    user_id: "demo-lister-1",
    property_id: "demo-pending-1",
    doc_type: "certificate_of_occupancy",
    storage_path:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
    file_name: "asokoro-c-of-o.pdf",
    mime_type: "application/pdf",
    status: "pending",
    reviewer_id: null,
    review_notes: null,
    submitted_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    reviewed_at: null,
    created_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "demo-doc-2",
    user_id: "demo-lister-1",
    property_id: null,
    doc_type: "nin",
    storage_path:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    file_name: "ibrahim-nin.jpg",
    mime_type: "image/jpeg",
    status: "pending",
    reviewer_id: null,
    review_notes: null,
    submitted_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    reviewed_at: null,
    created_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "demo-doc-3",
    user_id: "demo-lister-2",
    property_id: "demo-pending-2",
    doc_type: "agency_licence",
    storage_path:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80",
    file_name: "capital-agency-licence.pdf",
    mime_type: "application/pdf",
    status: "pending",
    reviewer_id: null,
    review_notes: null,
    submitted_at: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
    reviewed_at: null,
    created_at: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
  },
  {
    id: "demo-doc-4",
    user_id: "demo-lister-2",
    property_id: null,
    doc_type: "utility_bill",
    storage_path:
      "https://images.unsplash.com/photo-1554224311-beee460c201f?w=900&q=80",
    file_name: "office-utility-bill.jpg",
    mime_type: "image/jpeg",
    status: "pending",
    reviewer_id: null,
    review_notes: null,
    submitted_at: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
    reviewed_at: null,
    created_at: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
  },
];

export const DEMO_ADMIN_ACTIONS: AdminAction[] = [
  {
    id: "demo-action-1",
    admin_id: "demo-admin",
    action: "approve_property",
    target_type: "property",
    target_id: DEMO_PUBLIC_PROPERTIES[0].id,
    notes: "Documents matched listing address.",
    created_at: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
  },
];

/** In-memory demo mutations for local portal testing without Supabase. */
const demoState = {
  properties: [...DEMO_PENDING_PROPERTIES],
  profiles: [...DEMO_KYC_PROFILES],
  documents: [...DEMO_VERIFICATION_DOCUMENTS],
  actions: [...DEMO_ADMIN_ACTIONS],
};

export function getDemoAdminState() {
  return demoState;
}

export function resetDemoAdminState() {
  demoState.properties = DEMO_PENDING_PROPERTIES.map((p) => ({ ...p }));
  demoState.profiles = DEMO_KYC_PROFILES.map((p) => ({ ...p }));
  demoState.documents = DEMO_VERIFICATION_DOCUMENTS.map((d) => ({ ...d }));
  demoState.actions = [...DEMO_ADMIN_ACTIONS];
}
