import { BiochemicalProvider } from "@/contexts/biochemicalContext";
import "./globals.css";
import "./homepage.css";
import { UserProvider } from "@/contexts/userContext";
import { FoodProvider } from "@/contexts/foodContext";
import { RecordProvider } from "@/contexts/recordContext";
import { IntelligenceProvider } from "@/contexts/intelligenceContext";
import AppShell from "@/components/AppShell";
import { IBM_Plex_Sans, Inter, Manrope } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-plex" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });

const siteTitle = "Biolabs — Personalized Health & Biotech";
const siteDescription = "Connecting biology and machines: clinical workspaces, personalized health insight and computational biotech research.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://biolabsltd.com"),
  title: {
    default: siteTitle,
    template: "%s | Biolabs",
  },
  description: siteDescription,
  applicationName: "Biolabs",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Biolabs",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  appleWebApp: {
    capable: "yes",
    statusBarStyle: "black-translucent",
  },
};

// New separate viewport export
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
};

export default function RootLayout({ children, tools }) {
  return (
    <html lang="en" className={`${inter.variable} ${plex.variable} ${manrope.variable}`}>
      <head><meta name="msapplication-TileColor" content="#ffffff" /><meta name="theme-color" content="#ffffff" /></head>
      <body>
        <BiochemicalProvider>
          <FoodProvider>
            <RecordProvider>
              <IntelligenceProvider>
                <UserProvider>
                  <AppShell modal={tools} fontClass={`${inter.variable} ${plex.variable} ${manrope.variable}`}>{children}</AppShell>
                </UserProvider>
              </IntelligenceProvider>
            </RecordProvider>
          </FoodProvider>
        </BiochemicalProvider>
      </body>
    </html>
  );
}
