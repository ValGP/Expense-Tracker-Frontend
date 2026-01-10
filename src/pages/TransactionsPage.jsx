import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { SkeletonRow } from "../components/Skeleton";
import { getApiErrorMessage } from "../api/errorMessage";
import { useTransactionsPeriod } from "../hooks/useTransactions";
import { useAccounts, useCategories } from "../hooks/useLookups";
import { toMapById } from "../utils/lookup";
import { endOfMonthISO, monthLabel, startOfMonthISO } from "../utils/date";

function formatMoney(amount) {
  // amount viene como string (BigDecimal) o number
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(n);
}

export default function TransactionsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11

  const from = useMemo(() => startOfMonthISO(year, month), [year, month]);
  const to = useMemo(() => endOfMonthISO(year, month), [year, month]);

  const { data, isLoading, error } = useTransactionsPeriod(from, to);

  const accountsQ = useAccounts();
  const categoriesQ = useCategories();
  const navigate = useNavigate();

  const accountsMap = useMemo(
    () => toMapById(accountsQ.data),
    [accountsQ.data]
  );

  const categoriesMap = useMemo(
    () => toMapById(categoriesQ.data),
    [categoriesQ.data]
  );

  function prevMonth() {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function nextMonth() {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const visible = useMemo(() => {
    const list = data ?? [];
    return list.filter((tx) => tx.state !== "CANCELED");
  }, [data]);

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <button
          className="rounded-lg px-3 py-2 text-sm bg-gray-100"
          onClick={prevMonth}
        >
          ◀
        </button>

        <div className="text-sm font-semibold">{monthLabel(year, month)}</div>

        <button
          className="rounded-lg px-3 py-2 text-sm bg-gray-100"
          onClick={nextMonth}
        >
          ▶
        </button>
      </Card>

      {isLoading && (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {error && (
        <Card>
          <div className="text-sm text-red-700">
            {getApiErrorMessage(error)}
          </div>
        </Card>
      )}

      {!isLoading && !error && (visible?.length ?? 0) === 0 && (
        <Card>
          <div className="text-sm text-gray-600">
            No hay movimientos en este período.
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Probá creando un gasto/ingreso con el botón “+”.
          </div>
        </Card>
      )}

      {!isLoading && !error && (visible?.length ?? 0) > 0 && (
        <div className="space-y-3">
          {visible.map((tx) => (
            <button
              key={tx.id}
              type="button"
              className="w-full text-left"
              onClick={() => navigate(`/app/transactions/${tx.id}`)}
            >
              <Card className="flex items-center justify-between hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {tx.description || "(Sin descripción)"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {tx.operationDate}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    {categoriesMap[tx.categoryId]?.name ?? "Sin categoría"}
                    {" • "}
                    {tx.type === "EXPENSE"
                      ? accountsMap[tx.sourceAccountId]?.name
                      : accountsMap[tx.destinationAccountId]?.name}
                  </div>
                </div>

                <div className="text-sm font-semibold">
                  {tx.type === "EXPENSE"
                    ? "-"
                    : tx.type === "INCOME"
                    ? "+"
                    : ""}
                  {formatMoney(tx.amount)}
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
