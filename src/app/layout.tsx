import type { Metadata } from "next";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://verdara.space"),
  title: {
    default: "Verdara: see your whole eco-town, audit roof physics & material recovery",
    template: "%s | Verdara",
  },
  description:
    "Your neighborhood drawn as a living town of solar roofs, rainwater pipes, cisterns, and circular hubs. Powered by Meta SAM 3.1, Muse Spark, and NREL PVWatts v8.",
  keywords: [
    "Verdara",
    "Eco-Town Twin",
    "Solar Roof Physics",
    "Rainwater Cisterns",
    "Meta SAM 3.1",
    "Muse Spark",
    "Circular Economy",
    "Decarbonization Studio",
    "Climate Resilience",
    "Jakarta",
    "San Francisco",
    "NREL PVWatts",
    "Generative Building Twin",
  ],
  authors: [{ name: "Verdara Spatial Labs" }],
  creator: "Verdara Spatial Labs",
  publisher: "Verdara Spatial Labs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Verdara: see your whole eco-town, audit roof physics & material recovery",
    description:
      "A living 3D neighborhood digital twin connecting solar arrays, rainwater cisterns, and circular salvage hubs across 28 global biomes.",
    url: "https://verdara.space",
    siteName: "Verdara Eco-Town Studio",
    locale: "en_US",
    alternateLocale: ["id_ID"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdara: Living Eco-Town Twin & Physics Studio",
    description:
      "Explore neighborhood-scale solar generation, stormwater runoff routing, and circular material recovery powered by Meta AI.",
    creator: "@VerdaraEco",
  },
  other: {
    "geo.region": "ID-JK",
    "geo.placename": "Jakarta",
    "geo.position": "-6.2088;106.8456",
    ICBM: "-6.2088, 106.8456",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://verdara.space/#webapp",
      name: "Verdara Living Eco-Town Studio",
      url: "https://verdara.space",
      applicationCategory: "DesignApplication, UtilitiesApplication",
      operatingSystem: "All modern browsers with WebGL 2.0",
      description:
        "Interactive 3D digital twin platform calculating real-time solar roof generation, stormwater diversion, and circular material salvage powered by Meta SAM and Muse AI.",
      browserRequirements: "Requires WebGL 2.0 support",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Interactive 3D Eco-Island district simulation",
        "Roof physics audit with NREL PVWatts v8 calculation",
        "Rainwater runoff and biopori infiltration simulator",
        "Meta SAM 3.1 zero-shot building and solar footprint segmentation",
        "Meta Muse Spark 3-specialist multidisciplinary council",
        "Real-time climate normals for 28 Koppen climate zones",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://verdara.space/#organization",
      name: "Verdara Spatial Labs",
      url: "https://verdara.space",
      logo: "https://verdara.space/favicon.ico",
      sameAs: ["https://github.com/verdara-space"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "technical support",
        availableLanguage: ["English", "Indonesian"],
      },
    },
    {
      "@type": "Place",
      "@id": "https://verdara.space/#headquarters",
      name: "Verdara Global Climate Hub (Jakarta)",
      geo: {
        "@type": "GeoCoordinates",
        latitude: -6.2088,
        longitude: 106.8456,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jakarta",
        addressCountry: "ID",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("verdara_spatial_store_v3");if(s){var p=JSON.parse(s);var t=p&&p.state&&p.state.theme;if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}}catch(e){}`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen antialiased selection:bg-[#c6f432] selection:text-[#151515]"
      >
        {children}
        <SmoothScroll />
      </body>
    </html>
  );
}
