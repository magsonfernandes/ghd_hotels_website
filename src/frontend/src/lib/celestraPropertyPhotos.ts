export const celestraPropertyImage = (filename: string) =>
  `/Celestra Dodamarg/${encodeURIComponent(filename)}`;

export const CELESTRA_HERO_IMAGE = celestraPropertyImage("12.jpg");

export const CELESTRA_PROPERTY_PHOTOS = [
  { src: celestraPropertyImage("01.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("02.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("03.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("04.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("05.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("06.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("07.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("08.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("09.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("10.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("11.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("12.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("13.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("14.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("15.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("16.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("17.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("18.jpg"), alt: "Celéstra Dodamarg — property view" },
  {
    src: celestraPropertyImage("Banquet_view02.jpg"),
    alt: "Celéstra Dodamarg — banquet hall",
  },
  {
    src: celestraPropertyImage("Conference room__View02.jpg"),
    alt: "Celéstra Dodamarg — conference room",
  },
  {
    src: celestraPropertyImage("Conference room_view03.jpg"),
    alt: "Celéstra Dodamarg — conference room",
  },
] as const;
