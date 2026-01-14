import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useAccounts } from "../hooks/useLookups";
import {
  useUpdateAccount /*, useDeleteAccount */,
} from "../hooks/useAccountsCrud";
import { getApiErrorMessage } from "../api/errorMessage";

const ACCOUNT_TYPES = [
  "CASH",
  "BANK",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "DIGITAL_WALLET",
];

const ACCOUNT_TYPE_LABEL = {
  CASH: "Efectivo",
  BANK: "Cuenta bancaria",
  DEBIT_CARD: "Tarjeta de débito",
  CREDIT_CARD: "Tarjeta de crédito",
  DIGITAL_WALLET: "Billetera digital",
};

export default function AccountEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const accountId = Number(id);

  const q = useAccounts();
  const update = useUpdateAccount();
  // const remove = useDeleteAccount(); // <-- cuando lo tengas

  const account = useMemo(
    () => (q.data ?? []).find((a) => a.id === accountId) || null,
    [q.data, accountId]
  );

  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("DIGITAL_WALLET");
  const [currencyCode, setCurrencyCode] = useState("ARS");

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!account) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName((prev) => {
      const next = account.name ?? "";
      return prev === next ? prev : next;
    });

    setType((prev) => {
      const next = account.type ?? "DIGITAL_WALLET";
      return prev === next ? prev : next;
    });

    setCurrencyCode((prev) => {
      const next = account.currencyCode ?? "ARS";
      return prev === next ? prev : next;
    });
  }, [account]);

  if (q.isLoading) return <Loader text="Cargando..." />;
  if (q.error)
    return (
      <Card>
        <div className="text-sm text-red-700">
          {getApiErrorMessage(q.error)}
        </div>
      </Card>
    );

  if (!account)
    return (
      <Card>
        <div className="text-sm text-gray-600">Cuenta no encontrada.</div>
      </Card>
    );

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      await update.mutateAsync({
        id: accountId,
        payload: {
          name: name.trim() || null,
          type,
          currencyCode: currencyCode.trim().toUpperCase(),
          // active: se maneja vía "Eliminar/Archivar" (no checkbox)
        },
      });
      navigate("/app/accounts", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function confirmDelete() {
    setError("");

    try {
      // ✅ Elegí UNA de estas dos estrategias:

      // A) Si vas a borrar (delete real):
      // await remove.mutateAsync(accountId);

      // B) Si vas a "archivar" usando active=false (recomendado si hay transacciones asociadas):
      await update.mutateAsync({
        id: accountId,
        payload: {
          active: false,
        },
      });

      navigate("/app/accounts", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">Editar cuenta</div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">Tipo</span>
          <select
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABEL[t] ?? t}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Moneda (ISO)"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
        />

        <Button disabled={update.isPending || !name.trim()} className="w-full">
          {update.isPending ? "Guardando..." : "Guardar"}
        </Button>

        {/* Acción destructiva debajo del guardar */}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setDeleteOpen(true)}
        >
          Eliminar cuenta
        </Button>

        <Button
          variant="secondary"
          type="button"
          className="w-full"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </Button>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        title="¿Eliminar cuenta?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        destructive
        loading={update.isPending /* || remove?.isPending */}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          confirmDelete();
        }}
      />
    </Card>
  );
}
