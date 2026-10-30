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
  title: "Verdara: see your whole eco-town, audit roof physics & material recovery",
  description:
    "Your neighborhood drawn as a living town of solar roofs, rainwater pipes, cisterns, and circular hubs. Powered by Meta SAM 3.1, Muse Spark, and NREL PVWatts v8.",
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
