import RegisterForm from "./RegisterForm";
import { getAppSettings } from "@/lib/settings";
import AuthShell from "@/components/AuthShell";

export default async function RegisterPage() {
  const settings = await getAppSettings();

  return (
    <AuthShell
      appName={settings.appName}
      hasLogo={settings.hasLogo}
      hasBanner={settings.hasBanner}
      title="Crea tu cuenta"
      subtitle="El primer usuario registrado será administrador"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Inicia sesión
          </a>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
