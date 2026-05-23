export const nivaaraPropertyImage = (filename: string) =>
  `/Nivaara/${encodeURIComponent(filename)}`;

export const NIVAARA_PROPERTY_PHOTOS = [
  {
    src: nivaaraPropertyImage("Nivaara_Room_Pic_1.png"),
    alt: "Nivaãra Nerul — guest room",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Room_Pic_2.png"),
    alt: "Nivaãra Nerul — guest room",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Room_Pic_3.png"),
    alt: "Nivaãra Nerul — guest room",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Room_Pic_4.png"),
    alt: "Nivaãra Nerul — guest room",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Room_Pic_5.png"),
    alt: "Nivaãra Nerul — guest room",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Washroom_Pic1.png"),
    alt: "Nivaãra Nerul — bathroom",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Washroom_Pic2.png"),
    alt: "Nivaãra Nerul — bathroom",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Pool_Pic1.png"),
    alt: "Nivaãra Nerul — pool",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Pool_Pic2.png"),
    alt: "Nivaãra Nerul — pool area",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Terrace_Pic1.png"),
    alt: "Nivaãra Nerul — terrace",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Terrace_Pic2.png"),
    alt: "Nivaãra Nerul — terrace seating",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Reception_Pic1.png"),
    alt: "Nivaãra Nerul — reception",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Reception_Pic2.png"),
    alt: "Nivaãra Nerul — reception area",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Reception_Pic3.png"),
    alt: "Nivaãra Nerul — reception lounge",
  },
  {
    src: nivaaraPropertyImage("Nivaara_Full Building View_Pic1.png"),
    alt: "Nivaãra Nerul — building exterior",
  },
] as const;

export const NIVAARA_PROPERTY_PHOTO_SRCS = NIVAARA_PROPERTY_PHOTOS.map(
  (photo) => photo.src,
);
