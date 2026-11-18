import Icon from "@/components/Icon";
export default function ChatEmptyPage() {
  return (
    <div className="card flex h-[calc(100vh-140px)] items-center justify-center text-center text-slate-400">
      <div>
        <div className="flex justify-center text-slate-300"><Icon name="message" className="h-10 w-10" /></div>
        <p className="mt-2 text-sm">Selecciona una persona de la lista para empezar a chatear.</p>
      </div>
    </div>
  );
}
