/**
 * Test Data Fixtures
 * Datos de prueba para tests E2E
 */

// Usuario Partner de prueba
export const testPartner = {
  email: process.env.TEST_PARTNER_EMAIL || "partner@test.viotech.com",
  password: process.env.TEST_PARTNER_PASSWORD || "TestPassword123!",
  name: "Partner Test User",
  tier: "gold",
};

// Usuario sin rol Partner (para tests negativos)
export const testRegularUser = {
  email: process.env.TEST_USER_EMAIL || "user@test.viotech.com",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  name: "Regular Test User",
};

// Lead de prueba para crear
export const testLead = {
  name: "Test Lead",
  email: `testlead_${Date.now()}@example.com`,
  company: "Test Company S.A.S.",
  phone: "+57 300 123 4567",
  source: "referral" as const,
};

// Servicios para comparación
export const testServiceIds = [
  "svc-001", // Servicio básico
  "svc-002", // Servicio premium
  "svc-003", // Servicio enterprise
];

// Filtros de catálogo para pruebas
export const catalogFilters = {
  category: "consultoria",
  minPrice: 500000,
  maxPrice: 5000000,
  rating: 4,
};

// URLs de la aplicación
export const urls = {
  // Auth
  login: "/login",
  register: "/register",
  
  // Partners
  partnersDashboard: "/partners",
  partnersLeads: "/partners/leads",
  partnersCommissions: "/partners/commissions",
  partnersReferrals: "/partners/referrals",
  partnersTraining: "/partners/training",
  partnersReports: "/partners/reports",
  partnersMarketing: "/partners/marketing",
  
  // Marketplace / Services
  services: "/services",
  servicesCatalog: "/services/catalog",
  servicesCompare: "/services/catalog/compare",
  serviceDetail: (slug: string) => `/services/catalog/${slug}`,
  
  // Dashboard
  dashboard: "/dashboard",
};

// Selectores comunes (data-testid preferidos)
export const selectors = {
  // Loading states
  loading: '[data-testid="loading"]',
  skeleton: ".animate-pulse",
  
  // Navigation
  navPartners: '[data-testid="nav-partners"]',
  navMarketplace: '[data-testid="nav-marketplace"]',
  
  // Partner Dashboard
  partnerStats: '[data-testid="partner-stats"]',
  partnerTier: '[data-testid="partner-tier"]',
  leadsCard: '[data-testid="leads-card"]',
  commissionsCard: '[data-testid="commissions-card"]',
  
  // Leads
  leadsTable: '[data-testid="leads-table"]',
  createLeadBtn: 'button:has-text("Crear Lead")',
  leadForm: '[data-testid="lead-form"]',
  
  // Marketplace
  serviceCard: '[data-testid="service-card"]',
  serviceGrid: '[data-testid="service-grid"]',
  filterPanel: '[data-testid="filter-panel"]',
  compareBtn: 'button:has-text("Comparar")',
  
  // Forms
  submitBtn: 'button[type="submit"]',
  cancelBtn: 'button:has-text("Cancelar")',
  
  // Errors
  errorAlert: '[role="alert"]',
  toast: '[data-sonner-toast]',
};

