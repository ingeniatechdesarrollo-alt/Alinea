import LoginForm from "./LoginForm";
import { getAppSettings } from "@/lib/settings";
import AuthShell from "@/components/AuthShell";

export default async function LoginPage() {
  const settings = await getAppSettings();

  return (
    <AuthShell
      appName={settings.appName}
      hasLogo={settings.hasLogo}
      hasBanner={settings.hasBanner}
      title="Bienvenido de nuevo"
      subtitle={`Inicia sesión para continuar en ${settings.appName}`}
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <a href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Regístrate
          </a>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
