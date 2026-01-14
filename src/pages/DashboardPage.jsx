import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { StatCard } from "../components/StatCard";
import { ExpenseDonut } from "../components/ExpenseDonut";
import { getApiErrorMessage } from "../api/errorMessage";
import { useSummary } from "../hooks/useSummary";
import { useTransactionsPeriod } from "../hooks/useTransactions";
import { useAccounts, useCategories } from "../hooks/useLookups";
import { addMonths, formatMonthLabel, getMonthRangeISO } from "../utils/month";
import { formatShortDate } from "../utils/date";
import { ChevronLeft, ChevronRight } from "lucide-react";

function money(value, currency = "ARS") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
    n
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

  // DATA FOR EXPENSE DONUT
  const top = summary?.topCategories ?? [];
  const totalExpenseNum = Number(summary?.totalExpense ?? 0);

  // suma del top
  const topSum = top.reduce((acc, c) => acc + Number(c.total ?? 0), 0);

  // “Otros” = totalExpense - sumaTop
  const others = Math.max(0, totalExpenseNum - topSum);

  // Items del donut (top + otros)
  const donutItems = [
    ...top.map((c) => {
      const name =
        c.categoryName ||
        categoriesMap?.[c.categoryId]?.name ||
        "Sin categoría";
      const color = categoriesMap?.[c.categoryId]?.colorHex;

      return {
        label: name,
        value: c.total, // puede ser string BigDecimal
        color,
        _key: `cat-${c.categoryId}`,
      };
    }),
    ...(others > 0
      ? [
          {
            label: "Otros",
            value: others, // number
            color: "#9CA3AF",
            _key: "others",
          },
        ]
      : []),
  ];

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
            onClick={() => setMonthDate((d) => addMonths(d, -1))}
            aria-label="Mes anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => setMonthDate((d) => addMonths(d, 1))}
            aria-label="Mes siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="space-y-3">
        {/* Balance protagonista */}
        <StatCard
          title="Balance"
          value={money(summary?.net)}
          className="py-4 text-center"
          valueClassName="text-4xl"
          titleClassName="text-sm text-gray-500"
        />

        {/* Gastos / Ingresos */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Gastos del mes"
            value={money(summary?.totalExpense)}
            className="py-4"
            valueClassName="text-xl"
          />
          <StatCard
            title="Ingresos del mes"
            value={money(summary?.totalIncome)}
            className="py-4"
            valueClassName="text-xl"
          />
        </div>
      </div>

      {/* Expense structure */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Estructura de gastos</div>
          <button
            className="text-sm text-gray-600"
            onClick={() => navigate("/app/transactions")}
          >
            Ver
          </button>
        </div>

        <div className="mt-3">
          <ExpenseDonut
            items={donutItems}
            totalLabel="Gastos"
            totalValue={money(summary?.totalExpense)}
            height={190}
          />
        </div>

        {/* Mini leyenda */}
        <div className="mt-3 space-y-2">
          {donutItems.length === 0 ? (
            <div className="text-sm text-gray-600">
              Sin gastos confirmados en este período.
            </div>
          ) : (
            donutItems.slice(0, 20).map((c) => (
              <div
                key={c._key ?? c.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color || "#9CA3AF" }}
                  />
                  <div className="text-sm text-gray-800 truncate">
                    {c.label}
                  </div>
                </div>
                <div className="text-sm font-semibold">{money(c.value)}</div>
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
                        {accountName || "Cuenta"} •{" "}
                        {formatShortDate(tx.operationDate)}
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
