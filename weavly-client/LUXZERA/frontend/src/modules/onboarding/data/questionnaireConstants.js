// src/modules/onboarding/data/questionnaireConstants.js

/**
 * Canonical 15-Area Questionnaire Constants for Zyra V1 UserFitData.
 * Exactly matches the backend SaveFitDataRequestDto fields and constraints.
 */

// ── Q1: Height ──────────────────────────────────────────────────────────────
export const HEIGHT_RANGES = [
  "Under 150 cm",
  "150–159 cm",
  "160–169 cm",
  "170–179 cm",
  "180–189 cm",
  "190+ cm"
];

// ── Q2: Approximate Weight ──────────────────────────────────────────────────
export const WEIGHT_RANGES = [
  "Under 50 kg",
  "50–59 kg",
  "60–69 kg",
  "70–79 kg",
  "80–89 kg",
  "90–99 kg",
  "100+ kg"
];

// ── Q3: Clothing Size ───────────────────────────────────────────────────────
export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export const NUMERIC_SIZES = ["28", "30", "32", "34", "36", "38", "40"];

// ── Q4: Fit Preferences (multi-select) ──────────────────────────────────────
export const FIT_PREFERENCES = [
  "Regular",
  "Relaxed",
  "Slim",
  "Oversized",
  "Tailored",
  "Athletic"
];

// ── Q5 & Q6: Fashion Styles (Preferred & Avoided) ───────────────────────────
export const FASHION_STYLES = [
  "Casual",
  "Minimal",
  "Streetwear",
  "Vintage / Retro",
  "Classic",
  "Athleisure",
  "Bohemian",
  "High Fashion",
  "Avant-garde",
  "Formal / Smart Casual"
];

// ── Q7 & Q8: Clothing Types (Preferred & Avoided) ───────────────────────────
export const CLOTHING_TYPES = [
  "T-shirts",
  "Shirts",
  "Hoodies / Sweatshirts",
  "Jeans",
  "Trousers / Chinos",
  "Shorts",
  "Jackets / Outerwear",
  "Dresses",
  "Skirts",
  "Suits / Blazers",
  "Knitwear / Sweaters"
];

// ── Q9 & Q10: Colors (Preferred & Avoided) ──────────────────────────────────
export const COLOR_OPTIONS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF", border: true },
  { name: "Grey", hex: "#6B7280" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Beige / Tan", hex: "#D2B48C" },
  { name: "Brown", hex: "#78350F" },
  { name: "Olive Green", hex: "#556B2F" },
  { name: "Pastel Blue", hex: "#93C5FD" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Forest Green", hex: "#1B4D3E" },
  { name: "Pastel Pink", hex: "#FBCFE8" },
  { name: "Mustard", hex: "#D97706" }
];

export const AVOIDED_COLOR_OPTIONS = [
  { name: "Neon Yellow", hex: "#E7FE00" },
  { name: "Hot Pink", hex: "#FF1493" },
  { name: "Bright Orange", hex: "#FF5722" },
  { name: "Lime Green", hex: "#32CD32" },
  { name: "Pastel Yellow", hex: "#FEF08A" },
  { name: "Electric Blue", hex: "#00E5FF" }
];

// ── Q11 & Q12: Occasions (Multi & Primary) ──────────────────────────────────
export const OCCASIONS = [
  "Everyday / Casual",
  "Work / Office",
  "Night Out / Party",
  "Formal / Events",
  "Gym / Athletic",
  "Lounge / Relax",
  "Travel / Vacation",
  "Date Night"
];

// ── Q13: Clothing Budget ────────────────────────────────────────────────────
export const BUDGET_RANGES = [
  "Under ₹1,500",
  "₹1,500–₹2,500",
  "₹2,500–₹5,000",
  "₹5,000–₹10,000",
  "₹10,000+"
];

// ── Q14: Shopping Priorities (Max 3) ────────────────────────────────────────
export const SHOPPING_PRIORITIES = [
  "Fit",
  "Comfort",
  "Quality",
  "Price / Value",
  "Style & Trends",
  "Brand Prestige",
  "Sustainability",
  "Versatility"
];

// ── Q15: Fashion Goals ──────────────────────────────────────────────────────
export const FASHION_GOALS = [
  "Build complete outfits",
  "Discover personal style",
  "Upgrade wardrobe quality",
  "Dress better for work",
  "Find clothes that fit perfectly",
  "Experiment with new styles",
  "Save time shopping"
];
