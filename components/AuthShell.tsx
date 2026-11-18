import Icon from "@/components/Icon";

// Contenedor de las pantallas de acceso (login / registro): panel de marca
// en azul noche a la izquierda y el formulario a la derecha. En celular el
// panel se oculta y queda solo el formulario con el logo arriba.
type Props = {
  appName: string;
  hasLogo: boolean;
  hasBanner: boolean;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

const FEATURES = [
  "Proyectos, tareas y cronogramas alineados en un solo lugar",
  "Presupuestos, gastos y reportes de proyecto al día",
  "Chat del equipo y portal para tus clientes"
];

export default function AuthShell({ appName, hasLogo, hasBanner, title, subtitle, children, footer }: Props) {
  const logoSrc = hasLogo ? "/api/settings/logo-image" : "/logo.svg";

  return (
    <div className="mx-auto mt-4 grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-panel sm:mt-10 lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-ink-950 p-10 text-white lg:flex lg:flex-col">
        {hasBanner && (
          <img
            src="/api/settings/banner-image"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at 30% 30%, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 30% 30%, black, transparent 70%)"
          }}
        />

        <div className="relative flex items-center gap-3">
          <img src={logoSrc} alt={appName} className="h-11 w-11 rounded-xl object-contain ring-1 ring-white/10" />
          <span className="text-lg font-extrabold tracking-tight">{appName}</span>
        </div>

        <div className="relative mt-auto">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Todo tu equipo,
            <br />
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              alineado.
            </span>
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-500/20 text-[11px] text-brand-300 ring-1 ring-brand-400/30">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xs text-slate-500">© {new Date().getFullYear()} {appName}</p>
        </div>
      </aside>

      {/* Formulario */}
      <section className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
        <div className="mb-8">
          <img src={logoSrc} alt={appName} className="mb-6 h-11 w-11 rounded-xl object-contain shadow-card-hover lg:hidden" />
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
        <p className="mt-8 text-sm text-slate-500">{footer}</p>
      </section>
    </div>
  );
}
