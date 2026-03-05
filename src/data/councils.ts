export const REGION_DISPLAY_MAP: Record<string, string> = {
  southern: "Southern",
  central: "Central",
  gilgit: "Gilgit",
  hunza: "Hunza",
  ishkoman_punial: "Ishkoman Punial",
  gupis_yasin: "Gupis Yasin",
  lower_chitral: "Lower Chitral",
  upper_chitral: "Upper Chitral",
};

export const COUNCILS_BY_REGION: Record<string, string[]> = {
  southern: [
    "Garden",
    "Gulshan",
    "Kharadar",
    "Hyderabad",
    "Karimabad",
    "Tando Turel",
    "Thatta & Shah Bunder",
  ],
  central: [
    "Hafizabad",
    "Lahore",
    "Multan & Bahawalpur",
    "Peshawar",
    "Rawalpindi",
    "Sargodha",
  ],
  gilgit: ["Gilgit", "Skardu", "DSOR"],
  hunza: [
    "Altit & Karimabad",
    "Alyabad & Hyderabad",
    "Chuperson",
    "Gulmit",
    "Gujal Bala",
    "Nasirabad",
    "Shimshal",
  ],
  ishkoman_punial: [
    "Chatoorkhand",
    "Damas",
    "Gahkuch",
    "Immit",
    "Ishkoman",
    "Sherquilla",
    "Singal",
  ],
  gupis_yasin: [
    "Gholaghmuli",
    "Gupis",
    "Phunder",
    "Pingal",
    "Silgan",
    "Sultanabad",
    "Thoi",
    "Yasin",
  ],
  lower_chitral: [
    "Arkari",
    "Chitral Town",
    "Garamchashma",
    "Madaklasht",
    "Parabeg",
    "Shoghore",
    "Susum",
  ],
  upper_chitral: [
    "Bang",
    "Booni",
    "Brep",
    "Khot",
    "Laspur",
    "Mastuj",
    "Mulkhow",
    "Rech",
    "Central Torkhow",
    "Yarkhoon Lasht",
  ],
};

/**
 * Get display name for a region key
 */
export function getRegionDisplayName(key: string): string {
  return REGION_DISPLAY_MAP[key] || key;
}

/**
 * Get local councils for a given region key
 */
export function getLocalCouncilsByRegion(regionKey: string): string[] {
  return COUNCILS_BY_REGION[regionKey] || [];
}

/**
 * Get all regions as options for a select dropdown
 */
export function getRegionOptions() {
  return Object.entries(REGION_DISPLAY_MAP).map(([value, label]) => ({
    value,
    label,
  }));
}

/**
 * Find region key by local council name
 */
export function findRegionByLocalCouncil(localCouncil: string): string | null {
  for (const [region, councils] of Object.entries(COUNCILS_BY_REGION)) {
    if (councils.includes(localCouncil)) return region;
  }
  return null;
}
