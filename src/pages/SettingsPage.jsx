import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../auth/useAuth";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

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

      <Button variant="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>

      {import.meta.env.DEV && (
        <button
          className="w-full rounded-xl bg-gray-100 py-3 text-sm"
          onClick={() => {
            localStorage.setItem("et_token", "abc");
            window.location.reload();
          }}
        >
          Romper token (test)
        </button>
      )}
    </div>
  );
}
