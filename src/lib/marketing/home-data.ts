export const HOME_STATS = [
  { value: "20+", label: "Abuja districts" },
  { value: "Verified", label: "Listings only" },
  { value: "Realtime", label: "Landlord chat" },
  { value: "KYC", label: "Owner checks" },
] as const;

export const ABUJA_MARKETS = [
  {
    name: "Maitama",
    blurb: "Premium duplexes & estates",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    href: "/browse?district=maitama",
  },
  {
    name: "Wuse / Wuse II",
    blurb: "Central apartments & studios",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    href: "/browse?district=wuse_2",
  },
  {
    name: "Gwarinpa",
    blurb: "Family homes in gated estates",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    href: "/browse?district=gwarinpa",
  },
  {
    name: "Asokoro",
    blurb: "Diplomatic & executive rentals",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    href: "/browse?district=asokoro",
  },
  {
    name: "Lugbe",
    blurb: "Airport-road value homes",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    href: "/browse?district=lugbe",
  },
  {
    name: "Life Camp",
    blurb: "Modern estate living",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    href: "/browse?district=lifecamp",
  },
] as const;

export const FEATURES = [
  {
    title: "Verified search",
    body: "Only KYC-backed landlords and verified listings reach Browse — filter by district, budget, and beds.",
  },
  {
    title: "Publish after KYC",
    body: "Landlords upload NIN / C of O, get approved once, then publish homes to Browse themselves.",
  },
  {
    title: "Realtime chat",
    body: "Message owners from any listing with typing indicators, read receipts, and video walkthroughs.",
  },
  {
    title: "Abuja-first maps",
    body: "Explore Maitama to Lugbe on a live map with pins that snap to district centres when GPS is missing.",
  },
  {
    title: "Document vault",
    body: "Private KYC uploads for NIN, C of O, and agency licences — reviewed in the admin portal.",
  },
  {
    title: "Tour videos",
    body: "Upload property walkthroughs with live progress so tenants can inspect before they visit.",
  },
] as const;

/** Nigerian brands shown as sponsors / ecosystem logos (wordmarks). */
export const NIGERIA_SPONSORS = [
  { name: "Paystack", tag: "Payments" },
  { name: "Flutterwave", tag: "Payments" },
  { name: "GTBank", tag: "Banking" },
  { name: "Access Bank", tag: "Banking" },
  { name: "Zenith Bank", tag: "Banking" },
  { name: "Interswitch", tag: "Payments" },
  { name: "MTN Nigeria", tag: "Telecom" },
  { name: "Airtel Nigeria", tag: "Telecom" },
  { name: "PropertyPro", tag: "Real estate" },
  { name: "Nigeria Prop", tag: "Real estate" },
] as const;

export const USED_BY = [
  {
    role: "Tenant",
    name: "Adaeze O.",
    place: "Gwarinpa",
    quote:
      "I filtered verified 3-beds, chatted the landlord the same day, and scheduled a Saturday viewing.",
  },
  {
    role: "Landlord",
    name: "Ibrahim B.",
    place: "Asokoro",
    quote:
      "Uploaded my NIN and C of O once. After KYC approval I publish new units straight to Browse.",
  },
  {
    role: "Agent",
    name: "Ngozi E.",
    place: "Wuse",
    quote:
      "Clients trust the Verified badge. Tour videos and realtime chat close deals faster.",
  },
] as const;
