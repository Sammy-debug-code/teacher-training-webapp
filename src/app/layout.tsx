import type { Metadata, Viewport } from "next";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/playfair-display";
import "@fontsource/mukta/400.css";
import "@fontsource/mukta/600.css";
import "@fontsource/mukta/700.css";
import "@fontsource/tiro-devanagari-hindi";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bethel Teacher Training",
  description: "Training modules for teachers of Bethel Mission School, Kishanganj",
  applicationName: "Bethel Teacher Training",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Bethel Training" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#331e4e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface text-ink">{children}</body>
    </html>
  );
}
