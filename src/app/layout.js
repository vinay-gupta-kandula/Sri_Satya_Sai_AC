import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Sri Satya Sai AC & Refrigeration Services | AC Repair, Fridge Service, AC Installation Kakinada",
  description: "Prompt doorstep AC repair, fridge service, AC installation, gas refilling & jet foam cleaning in Kakinada. Same-day 60-90 min technician visit, genuine spare parts for Split AC, Refrigerators, Coolers & Central AC.",
  keywords: [
    "ac services",
    "fridge service",
    "ac repair",
    "ac installation",
    "refrigerator service",
    "ac service in kakinada",
    "fridge repair kakinada",
    "split ac repair near me",
    "ac gas refilling",
    "ac jet cleaning kakinada",
    "doorstep ac technician",
    "Sri Satya Sai AC repair"
  ],
  authors: [{ name: "Sri Satya Sai AC and Refrigeration Services" }],
  creator: "Sri Satya Sai AC and Refrigeration Services",
  publisher: "Sri Satya Sai AC and Refrigeration Services",
  formatDetection: {
    telephone: true,
    address: true,
  },
  openGraph: {
    title: "Sri Satya Sai AC & Refrigeration Services | Expert Doorstep Repair",
    description: "Expert doorstep AC and Refrigerator repairs in Kakinada. Same-day visit in 60-90 mins, genuine spares & certified technicians.",
    type: "website",
    locale: "en_IN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  "name": "Sri Satya Sai AC and Refrigeration Services",
  "image": "/images/hero-technician.jpg",
  "telephone": "+919666458789",
  "priceRange": "₹₹",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Seshagiri Rao St, Rama Rao Peta, beside SUBBAYYA GARI HOTEL",
    "addressLocality": "Kakinada",
    "addressRegion": "Andhra Pradesh",
    "postalCode": "533004",
    "addressCountry": "IN"
  },
  "areaServed": {
    "@type": "City",
    "name": "Kakinada"
  },
  "hasMap": "https://maps.app.goo.gl/kghuMkcFyQrAzcYv7",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "08:00",
    "closes": "21:30"
  },
  "makesOffer": [
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AC Services" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AC Repair" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AC Installation" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Fridge Service" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Refrigerator Service" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AC Gas Refilling" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Jet Foam Cleaning" } }
  ]
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var theme = saved ? saved : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
