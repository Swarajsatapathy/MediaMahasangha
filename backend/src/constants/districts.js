export const DISTRICT_MAP = {
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

export const normalizeDistrict = (district) => {
  if (typeof district !== "string") return district;
  const trimmed = district.trim();
  return DISTRICT_MAP[trimmed] || trimmed;
};

const DISTRICTS = [
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

export const ALL_VALID_DISTRICTS = [
  ...new Set([...DISTRICTS, ...Object.keys(DISTRICT_MAP)]),
];

export default DISTRICTS;