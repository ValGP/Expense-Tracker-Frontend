import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Loader } from "../components/Loader";
import { getApiErrorMessage } from "../api/errorMessage";
import { useAccounts, useCategories } from "../hooks/useLookups";
import {
  useCancelTransaction,
  useTransactionById,
  useUpdateTransaction,
} from "../hooks/useTransactionDetail";

function money(value, currency = "ARS") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
    n
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const txQ = useTransactionById(id);
  const updateM = useUpdateTransaction();
  const cancelM = useCancelTransaction();

  const accountsQ = useAccounts();
  const categoriesQ = useCategories();

  const accountsMap = useMemo(() => {
    const m = {};
    for (const a of accountsQ.data ?? []) m[a.id] = a;
    return m;
  }, [accountsQ.data]);

  const categoriesMap = useMemo(() => {
    const m = {};
    for (const c of categoriesQ.data ?? []) m[c.id] = c;
    return m;
  }, [categoriesQ.data]);

  const tx = txQ.data;

  const [editMode, setEditMode] = useState(false);
  const [description, setDescription] = useState("");
  const [operationDate, setOperationDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  // inicializar form cuando llega la tx (una vez por id)
  useEffect(() => {
    if (!tx) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDescription(tx.description ?? "");
    setOperationDate(tx.operationDate ?? "");
    setCategoryId(tx.categoryId ? String(tx.categoryId) : "");
  }, [tx?.id]); // importante: por id, no por objeto entero

  if (txQ.isLoading) return <Loader text="Cargando movimiento..." />;

  if (txQ.error) {
    return (
      <Card>
        <div className="text-sm text-red-700">
          {getApiErrorMessage(txQ.error)}
        </div>
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/app/transactions")}
          >
            Volver a Movimientos
          </Button>
        </div>
      </Card>
    );
  }

  const categoryName = categoriesMap[tx.categoryId]?.name ?? "Sin categoría";

  const accountName =
    tx.type === "EXPENSE"
      ? accountsMap[tx.sourceAccountId]?.name
      : accountsMap[tx.destinationAccountId]?.name;

  const sign = tx.type === "EXPENSE" ? "-" : tx.type === "INCOME" ? "+" : "";

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    try {
      await updateM.mutateAsync({
        id: tx.id,
        payload: {
          description: description || null,
          operationDate: operationDate || null,
          categoryId: categoryId ? Number(categoryId) : null,
          // tags: por ahora NO
        },
      });
      setEditMode(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleCancelTx() {
    const ok = window.confirm("¿Querés anular este movimiento?");
    if (!ok) return;

    try {
      await cancelM.mutateAsync(tx.id);
      navigate("/app/transactions", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Detalle</div>
          <div className="text-xs text-gray-500">
            {tx.type} • {tx.operationDate}
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-auto px-4 py-2"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Card>

      {error && (
        <Card>
          <div className="text-sm text-red-700">{error}</div>
        </Card>
      )}

      {!editMode ? (
        <>
          <Card className="space-y-2">
            <div className="text-xs text-gray-500">Monto</div>
            <div className="text-2xl font-semibold">
              {sign} {money(tx.amount)}
            </div>

            <div className="mt-2 text-sm">
              <div className="text-gray-500 text-xs">Categoría</div>
              <div className="font-medium">{categoryName}</div>
            </div>

            <div className="mt-2 text-sm">
              <div className="text-gray-500 text-xs">Cuenta</div>
              <div className="font-medium">{accountName || "Cuenta"}</div>
            </div>

            <div className="mt-2 text-sm">
              <div className="text-gray-500 text-xs">Descripción</div>
              <div className="font-medium">
                {tx.description || "(Sin descripción)"}
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Button onClick={() => setEditMode(true)}>Editar</Button>
            <Button
              variant="secondary"
              onClick={handleCancelTx}
              disabled={cancelM.isPending}
            >
              {cancelM.isPending ? "Anulando..." : "Anular movimiento"}
            </Button>
          </div>
        </>
      ) : (
        <Card className="space-y-3">
          <div className="text-lg font-semibold">Editar movimiento</div>

          <form className="space-y-3" onSubmit={handleSave}>
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />

            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">Fecha</span>
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
                type="date"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">
                Categoría
              </span>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Seleccionar categoría</option>
                {(categoriesQ.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <Button disabled={updateM.isPending}>
              {updateM.isPending ? "Guardando..." : "Guardar"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditMode(false);
                setError("");
                // reset form a valores actuales
                setDescription(tx.description ?? "");
                setOperationDate(tx.operationDate ?? "");
                setCategoryId(tx.categoryId ? String(tx.categoryId) : "");
              }}
            >
              Cancelar
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
