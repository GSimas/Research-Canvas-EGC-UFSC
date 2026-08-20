import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Canvas EGC",
  description: "Estruture, alinhe e comunique sua pesquisa no PPGEGC/UFSC.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "Research Canvas EGC", description: "Estruture, alinhe e comunique sua pesquisa.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Research Canvas EGC" }] },
  twitter: { card: "summary_large_image", title: "Research Canvas EGC", description: "Estruture, alinhe e comunique sua pesquisa.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
