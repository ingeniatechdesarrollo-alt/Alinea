"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import InstallAppButton from "@/components/InstallAppButton";
import Icon from "@/components/Icon";

export default function Navbar({
  user,
  appName,
  hasLogo
}: {
  user: SessionPayload;
  appName: string;
  hasLogo: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [avatarError, setAvatarError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const [calendarPending, setCalendarPending] = useState(0);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const prevInbox = useRef<number | null>(null);
  const prevChat = useRef<number | null>(null);
  const prevCalendar = useRef<number | null>(null);

  // Cierra el menú de celular solo al cambiar de página.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof Notification !== "undefined") setNotifPermission(Notification.permission);
  }, []);

  useEffect(() => {
    function poll() {
      fetch("/api/inbox/unread-count")
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.count !== "number") return;
          if (prevInbox.current !== null && data.count > prevInbox.current) {
            notify("Bandeja de entrada", "Tienes un requerimiento nuevo o sin responder.");
          }
          prevInbox.current = data.count;
          setInboxUnread(data.count);
        })
        .catch(() => {});

      fetch("/api/chat/unread-count")
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.count !== "number") return;
          if (prevChat.current !== null && data.count > prevChat.current) {
            notify("Chat", "Tienes un mensaje nuevo.");
          }
          prevChat.current = data.count;
          setChatUnread(data.count);
        })
        .catch(() => {});

      fetch("/api/calendar/pending-count")
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.count !== "number") return;
          if (prevCalendar.current !== null && data.count > prevCalendar.current) {
            notify("Calendario", "Tienes una cita nueva por aceptar o rechazar.");
          }
          prevCalendar.current = data.count;
          setCalendarPending(data.count);
        })
        .catch(() => {});
    }
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Refresca de inmediato el número de la bandeja cuando el usuario borra
  // o lee un requerimiento (sin esperar a que pase el sondeo de 15s de
  // arriba). Las páginas de la bandeja avisan con este evento.
  useEffect(() => {
    function refreshInboxBadge() {
      fetch("/api/inbox/unread-count")
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.count !== "number") return;
          prevInbox.current = data.count;
          setInboxUnread(data.count);
        })
        .catch(() => {});
    }
    window.addEventListener("ng-gp:inbox-updated", refreshInboxBadge);
    return () => window.removeEventListener("ng-gp:inbox-updated", refreshInboxBadge);
  }, []);

  function notify(title: string, body: string) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (typeof document !== "undefined" && document.visibilityState === "visible" && document.hasFocus()) return;
    try {
      new Notification(title, { body, icon: "/icons/icon-192.png" });
    } catch {
      // algunos navegadores móviles no soportan `new Notification(...)`; se ignora en silencio.
    }
  }

  function handleEnableNotifications() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then((perm) => setNotifPermission(perm));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Fuerza a traer la versión más nueva del sitio. Sirve sobre todo cuando
  // la app está instalada en el celular: al no tener barra de navegador, no
  // hay botón de recargar, así que este lo reemplaza (y de paso avisa al
  // service worker que revise si hay una versión nueva).
  function handleRefresh() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.update()));
    }
    window.location.reload();
  }

  const links = [
    { href: "/dashboard", label: "Proyectos", badge: 0 },
    { href: "/tasks", label: "Tareas", badge: 0 },
    { href: "/inbox", label: "Bandeja de entrada", badge: inboxUnread },
    { href: "/chat", label: "Chat", badge: chatUnread },
    { href: "/calendar", label: "Calendario", badge: calendarPending },
    { href: "/calendar-obras", label: "Calendario de equipo", badge: 0 },
    { href: "/reports", label: "Informes", badge: 0 },
    { href: "/team", label: "Mi equipo", badge: 0 },
    ...(user.role === "ADMIN" || user.role === "CONTABILIDAD"
      ? [{ href: "/contabilidad", label: "Contabilidad", badge: 0 }]
      : []),
    ...(user.role === "ADMIN"
      ? [
          { href: "/users", label: "Usuarios", badge: 0 },
          { href: "/areas", label: "Áreas de trabajo", badge: 0 },
          { href: "/settings", label: "Configuración", badge: 0 }
        ]
      : [])
  ];

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();


  const totalBadge = inboxUnread + chatUnread + calendarPending;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-1.5">
            <Link href="/dashboard" className="flex items-center gap-2">
              {hasLogo && !logoError ? (
                <img
                  src="/api/settings/logo-image"
                  alt={appName}
                  onError={() => setLogoError(true)}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <img src="/logo.svg" alt={appName} className="h-9 w-9 rounded-xl shadow-sm" />
              )}
              <span className="text-[15px] font-extrabold tracking-tight text-ink-900">{appName}</span>
            </Link>
            <button
              onClick={handleRefresh}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-brand-600"
              title="Actualizar la app a la versión más reciente"
              aria-label="Actualizar"
            >
              <Icon name="refresh" className="h-4 w-4" />
            </button>
          </div>
          {/* Menú horizontal: solo en pantallas medianas o más grandes. */}
          <nav className="hidden items-center gap-0.5 rounded-2xl border border-slate-200/70 bg-slate-100/60 p-1 text-sm font-medium text-slate-600 sm:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-xl px-3 py-1.5 transition duration-150 ${
                    active
                      ? "bg-white font-semibold text-ink-900 shadow-sm ring-1 ring-slate-200/80"
                      : "hover:bg-white/70 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                  {l.badge > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {l.badge > 9 ? "9+" : l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lado derecho: en escritorio se ve todo; en celular solo el botón de menú. */}
        <div className="hidden items-center gap-3 sm:flex">
          <InstallAppButton />
          {notifPermission === "default" && (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600"
              title="Recibir un aviso del navegador cuando llegue algo nuevo"
            >
              <Icon name="bell" className="h-3.5 w-3.5" /> Activar avisos
            </button>
          )}
          <Link href="/profile" className="flex items-center gap-2.5 rounded-2xl py-1 pl-1 pr-3 transition hover:bg-slate-100/80">
            {!avatarError ? (
              <img
                src={`/api/users/${user.userId}/avatar`}
                alt={user.name}
                onError={() => setAvatarError(true)}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ink-800 to-ink-950 text-xs font-bold text-brand-300 ring-2 ring-white shadow-sm">
                {initials}
              </span>
            )}
            <div className="text-sm leading-tight">
              <div className="font-medium text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="btn-ghost py-1.5 text-slate-500" title="Cerrar sesión">
            Cerrar sesión
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 sm:hidden"
          aria-label="Abrir menú"
        >
          {menuOpen ? <Icon name="x" className="h-5 w-5" /> : <Icon name="menu" className="h-5 w-5" />}
          {!menuOpen && totalBadge > 0 && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-brand-600" />
          )}
        </button>
      </div>

      {/* Menú desplegable de celular: enlaces uno debajo del otro, botones grandes. */}
      {menuOpen && (
        <div className="border-t border-slate-200/70 bg-white/95 backdrop-blur-xl sm:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3 text-sm font-medium text-slate-600">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                    active ? "bg-ink-900 font-semibold text-white" : "hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                  {l.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold text-white">
                      {l.badge > 9 ? "9+" : l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-2 border-t border-slate-100 px-4 py-3">
            <Link href="/profile" className="flex items-center gap-2 rounded-md px-1 py-1.5">
              {!avatarError ? (
                <img
                  src={`/api/users/${user.userId}/avatar`}
                  alt={user.name}
                  onError={() => setAvatarError(true)}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {initials}
                </span>
              )}
              <div className="text-sm leading-tight">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</div>
              </div>
            </Link>
            <InstallAppButton expanded />
            {notifPermission === "default" && (
              <button
                onClick={handleEnableNotifications}
                className="flex w-full items-center gap-2 rounded-md px-1 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Icon name="bell" className="h-4 w-4" /> Activar avisos
              </button>
            )}
            <button onClick={handleLogout} className="btn-secondary w-full py-2">
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
