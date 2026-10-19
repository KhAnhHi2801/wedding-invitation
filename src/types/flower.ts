export type GrowthStage = 'seed' | 'germination' | 'growth' | 'bud' | 'bloom' | 'completed';

export interface FlowerPalette {
  primary: string;
  secondary: string;
  accent: string;
  center: string;
  stem: string;
  leaf: string;
  leafHighlight: string;
  bud: string;
  soil: string;
}

export interface FlowerDefinition {
  id: string;
  name: string;
  scientificName: string;
  englishName: string;
  meaning: string;
  weddingSymbolism: string;
  tagline: string;
  colorName: string;
  palette: FlowerPalette;
  description: string;
  bloomCharacteristics: string;
  duration: {
    seed: number;
    germination: number;
    growth: number;
    bud: number;
    bloom: number;
  };
}

export interface WeddingWish {
  id: string;
  flowerId: string;
  flowerName: string;
  flowerScientific: string;
  guestName: string;
  relation: string;
  message: string;
  timestamp: string;
  accentColor: string;
}
