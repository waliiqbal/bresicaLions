import type { Sponsor } from "@/modules/sponsors/sponsor.types";

// Sample sponsors (made-up names). Real logos are uploaded from the admin panel.
export const sponsors: Sponsor[] = [
  { id: "s-1", name: "Lombardia Energia", url: "#", order: 1, active: true },
  { id: "s-2", name: "Banca di Brescia", url: "#", order: 2, active: true },
  { id: "s-3", name: "Garda Motors", url: "#", order: 3, active: true },
  { id: "s-4", name: "Colosseo Pizzeria", url: "#", order: 4, active: true },
  { id: "s-5", name: "Ferro & Figli", url: "#", order: 5, active: true },
];
