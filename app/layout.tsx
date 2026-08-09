import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "Алексей Орлов — репетитор по математике и физике",
    description: "Индивидуальные онлайн-занятия по математике и физике для 7–11 классов. Подготовка к ОГЭ и ЕГЭ.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: "Математика становится понятной",
      description: "Алексей Орлов — репетитор по математике и физике для 7–11 классов.",
      type: "website",
      locale: "ru_RU",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Алексей Орлов — репетитор" }],
    },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
