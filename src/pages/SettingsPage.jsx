import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../auth/useAuth";

function RowLink({ title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl px-3 py-3 text-left hover:bg-gray-50"
      type="button"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
          )}
        </div>
        <div className="text-gray-400">›</div>
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-lg font-semibold">Ajustes</div>
        <div className="mt-2 text-sm text-gray-600">
          {user ? (
            <>
              <div>{user.name}</div>
              <div className="text-gray-500">{user.email}</div>
            </>
          ) : (
            <div className="text-gray-500">Sesión activa</div>
          )}
        </div>
      </Card>

      <Card className="p-0">
        <div className="px-4 pt-4 text-sm font-semibold">Personalización</div>
        <div className="p-2">
          <RowLink
            title="Categorías"
            subtitle="Gestioná las categorías de gastos/ingresos"
            onClick={() => navigate("/app/settings/categories")}
          />
          <RowLink
            title="Tags"
            subtitle="(Después) Etiquetas para organizar movimientos"
            onClick={() => navigate("/app/settings/tags")}
          />
        </div>
      </Card>

      <Button
        variant="secondary"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      >
        Cerrar sesión
      </Button>
    </div>
  );
}
