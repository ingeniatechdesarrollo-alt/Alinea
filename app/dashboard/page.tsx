import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import NewProjectForm from "./NewProjectForm";

export default async function DashboardPage() {
  const user = await requireUser();

  // El gerente ve todas las obras del sistema, sin necesidad de ser dueño
  // ni miembro de cada una (igual que el administrador en las páginas de
  // cada proyecto).
  const projectWhere =
    user.role === "GERENTE"
      ? {}
      : { OR: [{ ownerId: user.userId }, { members: { some: { userId: user.userId } } }] };

  const projects = await prisma.project.findMany({
    where: projectWhere,
    include: { _count: { select: { tasks: true } }, members: true, owner: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-ink-950 px-6 py-7 text-white shadow-panel sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hola, {user.name.split(" ")[0]}</h1>
            <div className="mt-5 flex gap-3">
              <div className="rounded-2xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
                <div className="text-xl font-extrabold">{projects.length}</div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Proyectos</div>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
                <div className="text-xl font-extrabold">
                  {projects.reduce((n, p) => n + p._count.tasks, 0)}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Tareas</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/projects/global" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
              Proyectos globales
            </Link>
            <NewProjectForm />
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Mis proyectos</h2>

      {projects.length === 0 ? (
        <div className="card border-dashed p-12 text-center text-slate-500">
          Aún no tienes proyectos. Crea el primero para empezar a asignar tareas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="card group relative overflow-hidden p-5">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 text-sm font-bold text-brand-300">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <h2 className="font-bold leading-snug text-ink-900">{p.name}</h2>
                </div>
                {p.boardMode === "ADMIN" && (
                  <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                    Administrativo
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description || "Sin descripción"}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                <span>{p._count.tasks} tareas</span>
                <span>{p.members.length} miembros</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">Dueño: {p.owner.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
