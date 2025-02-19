import { black, white } from "@/tailwind.config";
import { Klee_One, Sometype_Mono } from "next/font/google";


const kleeOne = Klee_One({
  variable: "--font-klee-one",
  weight: ["400", "600"],
  subsets: ["latin", "cyrillic", "greek-ext", "latin-ext"],
});

const sometypeMono = Sometype_Mono({
  variable: "--font-sometype-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
});

export const font = {
  kleeOne,
  sometypeMono,
};

export const globalTheme = {
  background: white,
  foreground: black,
} as const;
