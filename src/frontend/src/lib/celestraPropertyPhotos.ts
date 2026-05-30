export const celestraPropertyImage = (filename: string) =>
  `/Celestra Dodamarg/${encodeURIComponent(filename)}`;

export const CELESTRA_HERO_IMAGE = celestraPropertyImage("12.jpg");

export const CELESTRA_PROPERTY_PHOTOS = [
  { src: celestraPropertyImage("01.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("02.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("03.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("04.jpg"), alt: "Celéstra Dodamarg — property view" },
  { src: celestraPropertyImage("07.jpg"), alt: "Celéstra Dodamarg — property view" },
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
    src: celestraPropertyImage("Celestra_Exterior_Day.png"),
    alt: "Celéstra Dodamarg — building exterior by day",
  },
  {
    src: celestraPropertyImage("Celestra_Exterior_Night.png"),
    alt: "Celéstra Dodamarg — building exterior at night",
  },
  {
    src: celestraPropertyImage("Room_Studio_View_01.jpg"),
    alt: "Celéstra Dodamarg — studio suite",
  },
  {
    src: celestraPropertyImage("Room_Studio_View_02.jpg"),
    alt: "Celéstra Dodamarg — studio suite living area",
  },
  {
    src: celestraPropertyImage("Room_Studio_View_03.jpg"),
    alt: "Celéstra Dodamarg — studio suite interior",
  },
  {
    src: celestraPropertyImage("Room_Studio_Living.jpg"),
    alt: "Celéstra Dodamarg — studio lounge and kitchenette",
  },
  {
    src: celestraPropertyImage("Room_Bedroom_View.jpg"),
    alt: "Celéstra Dodamarg — guest room",
  },
  {
    src: celestraPropertyImage("Room_Bedroom_Wide.png"),
    alt: "Celéstra Dodamarg — guest room with seating area",
  },
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
