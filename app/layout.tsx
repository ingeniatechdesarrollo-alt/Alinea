import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import Navbar from "@/components/Navbar";
import PresenceHeartbeat from "@/components/PresenceHeartbeat";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Permite "Agregar a pantalla de inicio" en iOS y Android: la app se abre en
// pantalla completa, sin la barra del navegador, como una app instalada.
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d9488"
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  const icon = settings.hasLogo ? "/api/settings/logo-image" : "/logo.svg";
  const appleIcon = settings.hasLogo ? "/api/settings/logo-image" : "/icons/apple-touch-icon.png";
  return {
    title: settings.appName,
    description: "Seguimiento de proyectos, tareas y requerimientos del equipo",
    manifest: "/manifest.webmanifest",
    icons: {
      icon,
      apple: appleIcon
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.appName
    }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const settings = await getAppSettings();

  let bodyStyle: React.CSSProperties = {};
  let bodyClassName = "min-h-screen app-bg";

  if (user) {
    const prefs = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { backgroundColor: true, hasBackgroundImage: true }
    });
    if (prefs?.hasBackgroundImage) {
      bodyClassName = "min-h-screen bg-slate-50 bg-cover bg-center bg-fixed";
      bodyStyle = { backgroundImage: "url(/api/profile/background-image)" };
    } else if (prefs?.backgroundColor) {
      bodyClassName = "min-h-screen";
      bodyStyle = { backgroundColor: prefs.backgroundColor };
    }
  }

  return (
    <html lang="es" className={fontSans.variable}>
      <body className={bodyClassName} style={bodyStyle}>
        <ServiceWorkerRegister />
        {user && <PresenceHeartbeat />}
        {user && <Navbar user={user} appName={settings.appName} hasLogo={settings.hasLogo} />}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
