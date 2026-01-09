import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { getApiErrorMessage } from "../api/errorMessage";
import { useAccounts } from "../hooks/useLookups";

function money(n, currency = "ARS") {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
    v
  );
}

export default function AccountsPage() {
  const navigate = useNavigate();
  const q = useAccounts();

  if (q.isLoading) return <Loader text="Cargando cuentas..." />;
  if (q.error)
    return (
      <Card>
        <div className="text-sm text-red-700">
          {getApiErrorMessage(q.error)}
        </div>
      </Card>
    );

  const accounts = q.data ?? [];

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div className="text-lg font-semibold">Cuentas</div>
        <button
          onClick={() => navigate("/app/accounts/new")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-xl"
          aria-label="Agregar"
        >
          +
        </button>
      </Card>

      {accounts.length === 0 ? (
        <Card>
          <div className="text-sm text-gray-600">No tenés cuentas todavía.</div>
          <div className="mt-2">
            <Button onClick={() => navigate("/app/accounts/new")}>
              Crear primera cuenta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{a.name}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {a.type} • {a.currencyCode} •{" "}
                  {a.active ? "Activa" : "Archivada"}
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {money(a.currentBalance, a.currencyCode)}
                </div>
              </div>

              <button
                className="rounded-lg px-3 py-2 text-sm bg-gray-100"
                onClick={() => navigate(`/app/accounts/${a.id}`)}
              >
                Editar
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
