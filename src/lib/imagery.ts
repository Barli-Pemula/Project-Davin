export const photos = {
  fisher: {
    src: "/photos/banyuwangi-fisher.jpg",
    alt: "Nelayan berlayar saat matahari terbit di Banyuwangi, Jawa Timur",
    location: "Banyuwangi, Jawa Timur",
    credit: "M Joko Apriyo Putro",
    source: "https://commons.wikimedia.org/wiki/File:Nelayan_Melaut.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  seaweed: {
    src: "/photos/lembongan-seaweed.jpg",
    alt: "Area budidaya rumput laut di Nusa Lembongan, Bali",
    location: "Nusa Lembongan, Bali",
    credit: "yeowatzup",
    source:
      "https://commons.wikimedia.org/wiki/File:Seaweed_Farming,_Nusa_Lembongan,_Bali_(492092102).jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  fishing: {
    src: "/photos/karimunjawa-fishing.jpg",
    alt: "Perahu nelayan di pelabuhan Karimunjawa, Jawa Tengah",
    location: "Karimunjawa, Jawa Tengah",
    credit: "Sam Hidayat",
    source:
      "https://commons.wikimedia.org/wiki/File:Perahu_Nelayan_di_Pelabuhan_Karimunjawa.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
} as const;

export function projectPhoto(category: string) {
  return category === "TANGKAP" ? photos.fishing : photos.seaweed;
}
