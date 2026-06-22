export const CROP_EMOJIS = {
  wheat: '🌾',
  rice: '🍚',
  cotton: '☁️',
  sugarcane: '🍃',
  maize: '🌽',
  bajra: '🌾',
  jowar: '🌾',
  soybean: '🫘',
  groundnut: '🥜',
  potato: '🥔',
  onion: '🧅',
  tomato: '🍅'
};

export const DAMAGE_EMOJIS = {
  flood: '🌊',
  drought: '🍂',
  pest: '🐛',
  disease: '🦠',
  storm: '⚡',
  hail: '🧊',
  fire: '🔥',
  other: '⚠️'
};

export const getCropEmoji = (crop) => CROP_EMOJIS[crop?.toLowerCase()] || '🌱';
export const getDamageEmoji = (damage) => DAMAGE_EMOJIS[damage?.toLowerCase()] || '⚠️';
export const formatCropLabel = (crop) => `${getCropEmoji(crop)} ${crop.charAt(0).toUpperCase() + crop.slice(1)}`;
export const formatDamageLabel = (damage) => `${getDamageEmoji(damage)} ${damage.charAt(0).toUpperCase() + damage.slice(1)}`;
