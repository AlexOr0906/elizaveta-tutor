import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Елизавета Вячеславовна — математика и русский язык",
  description: "Занятия по математике и русскому языку для учеников 1–9 классов онлайн и офлайн. Школьная программа, ВПР и подготовка к ОГЭ.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Елизавета Вячеславовна — преподаватель",
    description: "Математика и русский язык для учеников 1–9 классов онлайн и офлайн.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
