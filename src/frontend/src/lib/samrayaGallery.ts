/** Property carousel — sources under public/SAMRAYA/photos/. */
export const SAMRAYA_PROPERTY_GALLERY = {
  title: "Samraya Dodamarg",
  images: [
    ...[
      "samraya-villa-01",
      "samraya-villa-02",
      "samraya-villa-03",
      "samraya-villa-04",
    ].map((base, i) => ({
      src: `/SAMRAYA/photos/${base}.jpg`,
      alt: `Samraya villa interior and suite ${i + 1}`,
    })),
    ...[
      "samraya-2bhk-01",
      "samraya-2bhk-02",
      "samraya-2bhk-03",
      "samraya-2bhk-04",
      "samraya-2bhk-05",
    ].map((base, i) => ({
      src: `/SAMRAYA/photos/${base}.jpg`,
      alt: `Samraya two-bedroom residence ${i + 1}`,
    })),
    ...[
      "samraya-1bhk-01",
      "samraya-1bhk-02",
      "samraya-1bhk-03",
      "samraya-1bhk-04",
      "samraya-1bhk-05",
      "samraya-1bhk-06",
      "samraya-1bhk-07",
      "samraya-1bhk-08",
    ].map((base, i) => ({
      src: `/SAMRAYA/photos/${base}.jpg`,
      alt: `Samraya one-bedroom residence ${i + 1}`,
    })),
    ...Array.from({ length: 12 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return {
        src: `/SAMRAYA/photos/samraya-gallery-${n}.png`,
        alt: `Samraya Dodamarg property view ${i + 1}`,
      };
    }),
  ],
} as const;
