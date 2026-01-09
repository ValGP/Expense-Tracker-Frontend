import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { useAccounts } from "../hooks/useLookups";
import { useUpdateAccount } from "../hooks/useAccountsCrud";
import { getApiErrorMessage } from "../api/errorMessage";

const ACCOUNT_TYPES = [
  "CASH",
  "BANK",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "DIGITAL_WALLET",
];

export default function AccountEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const accountId = Number(id);

  const q = useAccounts();
  const update = useUpdateAccount();

  const account = useMemo(
    () => (q.data ?? []).find((a) => a.id === accountId) || null,
    [q.data, accountId]
  );

  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("DIGITAL_WALLET");
  const [currencyCode, setCurrencyCode] = useState("ARS");
  const [active, setActive] = useState(true);

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

    setActive((prev) => {
      const next = !!account.active;
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
          active,
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
                {t}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Moneda (ISO)"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Activa
        </label>

        <Button disabled={update.isPending || !name.trim()}>
          {update.isPending ? "Guardando..." : "Guardar"}
        </Button>

        <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </form>
    </Card>
  );
}
