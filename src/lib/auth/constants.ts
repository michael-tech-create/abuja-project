export const SIGNUP_ROLE_COOKIE = "abj_signup_role";
export const AUTH_REDIRECT_COOKIE = "abj_auth_redirect";

export const ROLE_OPTIONS = [
  {
    value: "tenant" as const,
    title: "Tenant",
    description: "Browse verified listings and chat with landlords.",
  },
  {
    value: "landlord" as const,
    title: "Landlord",
    description: "List your properties and respond to tenant enquiries.",
  },
  {
    value: "agent" as const,
    title: "Agent",
    description: "Manage listings for clients and handle verification docs.",
  },
];
