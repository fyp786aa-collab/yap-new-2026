import jamatkhanaData from "../../data/jamatkhan.json";

const JAMATKHANAS: Record<string, string[]> = jamatkhanaData;

/**
 * Map local council display names to jamatkhana JSON keys
 * The JSON uses lowercase with underscores/special chars
 */
const LOCAL_COUNCIL_KEY_MAP: Record<string, string> = {
  Garden: "garden",
  Gulshan: "gulshan",
  Kharadar: "kharadar",
  Hyderabad: "hyderabad",
  Karimabad: "karimabad",
  "Tando Turel": "tando_turel",
  "Thatta & Shah Bunder": "thatta_&_shah_bunder",
  Hafizabad: "hafizabad",
  Lahore: "lahore",
  "Multan & Bahawalpur": "multan_&_bahawalpur",
  Peshawar: "peshawar",
  Rawalpindi: "rawalpindi",
  Sargodha: "sargodha",
  Gilgit: "gilgit",
  Skardu: "skardu",
  "Sul, Dan & Oshikhandas": "sul,_dan_&_oshikhandas",
  "Altit & Karimabad": "altit_&_karimabad",
  "Alyabad & Hyderabad": "alyabad_&_hyderabad",
  Chuperson: "chuperson",
  Gulmit: "gulmit",
  "Gujal Bala": "gujal_bala",
  Nasirabad: "nasirabad",
  Shimshal: "shimshal",
  Chatoorkhand: "chatoorkhand",
  Damas: "damas",
  Gahkuch: "gahkuch",
  Immit: "immit",
  Ishkoman: "ishkoman",
  Sherquilla: "sherquilla",
  Singal: "singal",
  Gholaghmuli: "gholaghmuli",
  Gupis: "gupis",
  Phunder: "phunder",
  Pingal: "pingal",
  Silgan: "silgan",
  Sultanabad: "sultanabad",
  Thoi: "thoi",
  Yasin: "yasin",
  Arkari: "arkari",
  "Chitral Town": "chitral_town",
  Garamchashma: "garamchashma",
  Madaklasht: "madaklasht",
  Parabeg: "parabeg",
  Shoghore: "shoghore",
  Susum: "susum",
  Bang: "bang",
  Booni: "booni",
  Brep: "brep",
  Khot: "khot",
  Laspur: "laspur",
  Mastuj: "mastuj",
  Mulkhow: "mulkhow",
  Rech: "rech",
  Washich: "washich",
  "Yarkhoon Lasht": "yarkhoon_lasht",
};

/**
 * Get jamatkhanas for a local council display name
 */
export function getJamatkhanasByLocalCouncil(localCouncil: string): string[] {
  const key = LOCAL_COUNCIL_KEY_MAP[localCouncil];
  if (!key) return [];
  return JAMATKHANAS[key] || [];
}

/**
 * Get all local council keys that have jamatkhana data
 */
export function getAllLocalCouncilKeys(): string[] {
  return Object.keys(LOCAL_COUNCIL_KEY_MAP);
}

export { JAMATKHANAS, LOCAL_COUNCIL_KEY_MAP };
