import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { getApiErrorMessage } from "../api/errorMessage";
import { useSummary } from "../hooks/useSummary";
import { useTransactionsPeriod } from "../hooks/useTransactions";
import { useAccounts, useCategories } from "../hooks/useLookups";
import { addMonths, formatMonthLabel, getMonthRangeISO } from "../utils/month";

function money(value, currency = "ARS") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
    n
  );
}

function StatCard({ title, value }) {
  return (
    <Card>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [monthDate, setMonthDate] = useState(() => new Date());
  const { from, to } = useMemo(() => getMonthRangeISO(monthDate), [monthDate]);

  const summaryQ = useSummary(from, to, 5);
  const txQ = useTransactionsPeriod(from, to);

  const accountsQ = useAccounts();
  const categoriesQ = useCategories();

  const accountsMap = useMemo(() => {
    const list = accountsQ.data ?? [];
    const m = {};
    for (const a of list) m[a.id] = a;
    return m;
  }, [accountsQ.data]);

  const categoriesMap = useMemo(() => {
    const list = categoriesQ.data ?? [];
    const m = {};
    for (const c of list) m[c.id] = c;
    return m;
  }, [categoriesQ.data]);

  const isLoading = summaryQ.isLoading || txQ.isLoading;
  const error = summaryQ.error || txQ.error;

  const lastTx = useMemo(() => {
    const list = txQ.data ?? [];
    // ordenar por recordedAt desc (si no existe, fallback a operationDate)
    const sorted = [...list].sort((a, b) => {
      const da = a.recordedAt
        ? new Date(a.recordedAt).getTime()
        : new Date(a.operationDate).getTime();
      const db = b.recordedAt
        ? new Date(b.recordedAt).getTime()
        : new Date(b.operationDate).getTime();
      return db - da;
    });
    return sorted.slice(0, 5);
  }, [txQ.data]);

  if (isLoading) return <Loader text="Cargando resumen..." />;

  if (error) {
    return (
      <Card>
        <div className="text-sm text-red-700">{getApiErrorMessage(error)}</div>
      </Card>
    );
  }

  const summary = summaryQ.data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Resumen</div>
          <div className="text-xs text-gray-500">
            {formatMonthLabel(monthDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-gray-100"
            onClick={() => setMonthDate((d) => addMonths(d, -1))}
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-gray-100"
            onClick={() => setMonthDate((d) => addMonths(d, 1))}
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard title="Gastos del mes" value={money(summary?.totalExpense)} />
        <StatCard
          title="Ingresos del mes"
          value={money(summary?.totalIncome)}
        />
        <StatCard title="Balance" value={money(summary?.net)} />
      </div>

      {/* Top Categories */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Top categorías</div>
          <button
            className="text-sm text-gray-600"
            onClick={() => navigate("/app/settings/categories")}
          >
            Ver
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {(summary?.topCategories ?? []).length === 0 ? (
            <div className="text-sm text-gray-600">
              Sin gastos confirmados en este período.
            </div>
          ) : (
            summary.topCategories.slice(0, 5).map((c) => (
              <div
                key={c.categoryId}
                className="flex items-center justify-between"
              >
                <div className="text-sm text-gray-800">
                  {c.categoryName ||
                    categoriesMap[c.categoryId]?.name ||
                    "Sin categoría"}
                </div>
                <div className="text-sm font-semibold">{money(c.total)}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Last movements */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Últimos movimientos</div>
          <button
            className="text-sm text-gray-600"
            onClick={() => navigate("/app/transactions")}
          >
            Ver todos
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {lastTx.length === 0 ? (
            <div className="text-sm text-gray-600">
              Todavía no registraste movimientos.
            </div>
          ) : (
            lastTx.map((tx) => {
              const categoryName =
                categoriesMap[tx.categoryId]?.name ?? "Sin categoría";
              const accountName =
                tx.type === "EXPENSE"
                  ? accountsMap[tx.sourceAccountId]?.name
                  : accountsMap[tx.destinationAccountId]?.name;

              const sign = tx.type === "EXPENSE" ? "-" : "+";
              return (
                <button
                  key={tx.id}
                  type="button"
                  className="w-full rounded-xl px-3 py-3 text-left hover:bg-gray-50"
                  onClick={() => navigate(`/app/transactions/${tx.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {tx.description || categoryName}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {accountName || "Cuenta"} • {tx.operationDate}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {sign} {money(tx.amount)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-3">
          <Button onClick={() => navigate("/app/transactions/new")}>
            + Nuevo movimiento
          </Button>
        </div>
      </Card>
    </div>
  );
}
