export const DISTRICT_ALIASES: Record<string, string> = {
  Angul: "Anugola",
  Balasore: "Baleshwar",
  Bargarh: "Baragada",
  Cuttack: "Kataka",
  Katak: "Kataka",
  Deogarh: "Debagada",
  Kandhamal: "Kandhamala",
  Kendrapara: "Kendrapada",
  Keonjhar: "Kendujhar",
  Nayagarh: "Nayagada",
  Rourkela: "Raurkela",
  Sonpur: "Subarnapur",
  Sonepur: "Subarnapur",
  Sundargarh: "Sundaragada",
  Bolangir: "Balangir",
  Khurda: "Khordha",
};

export const normalizeDistrict = (district?: string | null): string => {
  if (!district) return "";
  const trimmed = district.trim();
  return DISTRICT_ALIASES[trimmed] || trimmed;
};

export const DISTRICTS = [
  "Anugola",
  "Balangir",
  "Baleshwar",
  "Baragada",
  "Bhadrak",
  "Bhubaneswar",
  "Boudh",
  "Debagada",
  "Dhenkanal",
  "Gajapati",
  "Ganjam",
  "Jagatsinghpur",
  "Jajpur",
  "Jharsuguda",
  "Kalahandi",
  "Kandhamala",
  "Kataka",
  "Kendrapada",
  "Kendujhar",
  "Khordha",
  "Koraput",
  "Malkangiri",
  "Mayurbhanj",
  "Nabarangpur",
  "Nayagada",
  "Nuapada",
  "Puri",
  "Raurkela",
  "Rayagada",
  "Sambalpur",
  "Subarnapur",
  "Sundaragada",
];
