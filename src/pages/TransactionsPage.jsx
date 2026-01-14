import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { SkeletonRow } from "../components/Skeleton";
import { BottomSheet } from "../components/BottomSheet";
import { getApiErrorMessage } from "../api/errorMessage";
import { useTransactionsPeriod } from "../hooks/useTransactions";
import { useAccounts, useCategories } from "../hooks/useLookups";
import { toMapById } from "../utils/lookup";
import { formatShortDate } from "../utils/date";
import { endOfMonthISO, monthLabel, startOfMonthISO } from "../utils/date";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

function formatMoney(amount) {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(n);
}

function getTxAccountId(tx) {
  // Para filtrar por cuenta, usamos la relevante según el tipo
  if (tx.type === "EXPENSE") return tx.sourceAccountId ?? null;
  if (tx.type === "INCOME") return tx.destinationAccountId ?? null;
  if (tx.type === "TRANSFER") return tx.sourceAccountId ?? null; // MVP
  return null;
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

  // Base List
  const visible = useMemo(() => {
    const list = data ?? [];
    return list.filter((tx) => tx.state !== "CANCELED");
  }, [data]);

  // --------------------
  // Filtros + búsqueda (estado)
  // --------------------
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const [accountId, setAccountId] = useState(""); // "" = todas
  const [categoryId, setCategoryId] = useState(""); // "" = todas

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return (visible ?? []).filter((tx) => {
      // cuenta
      if (accountId) {
        const txAccId = getTxAccountId(tx);
        if (String(txAccId) !== String(accountId)) return false;
      }

      // categoría
      if (categoryId) {
        if (String(tx.categoryId ?? "") !== String(categoryId)) return false;
      }

      // búsqueda
      if (search) {
        const desc = (tx.description ?? "").toLowerCase();

        const catName = (
          categoriesMap[tx.categoryId]?.name ?? ""
        ).toLowerCase();

        const accName =
          (tx.type === "EXPENSE"
            ? accountsMap[tx.sourceAccountId]?.name
            : accountsMap[tx.destinationAccountId]?.name
          )?.toLowerCase?.() ?? "";

        const opDate = (tx.operationDate ?? "").toLowerCase();

        const haystack = `${desc} ${catName} ${accName} ${opDate}`;
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [visible, q, accountId, categoryId, accountsMap, categoriesMap]);

  const activeFiltersCount =
    (accountId ? 1 : 0) + (categoryId ? 1 : 0) + (q.trim() ? 1 : 0);

  function clearFilters() {
    setQ("");
    setAccountId("");
    setCategoryId("");
  }

  return (
    <div className="space-y-4">
      {/* Header: mes + botón filtros */}
      <Card className="flex items-center justify-between">
        <button
          className="rounded-lg bg-gray-100 p-2"
          onClick={prevMonth}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-sm font-semibold">{monthLabel(year, month)}</div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter size={16} />
            {activeFiltersCount ? ` (${activeFiltersCount})` : ""}
          </button>

          <button
            className="rounded-lg bg-gray-100 p-2"
            onClick={nextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </Card>

      {/* BottomSheet filtros */}
      <BottomSheet
        open={filtersOpen}
        title="Filtros"
        onClose={() => setFiltersOpen(false)}
      >
        <div className="space-y-3">
          {/* Cuenta */}
          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Cuenta</span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Todas</option>
              {(accountsQ.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currencyCode})
                </option>
              ))}
            </select>
          </label>

          {/* Categoría */}
          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Categoría</span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Todas</option>
              {(categoriesQ.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl bg-black py-3 text-sm font-medium text-white"
              onClick={() => setFiltersOpen(false)}
            >
              Aplicar
            </button>

            <button
              type="button"
              className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700"
              onClick={clearFilters}
            >
              Limpiar
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Loading / Error */}
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

      {/* Empty */}
      {!isLoading && !error && (filtered?.length ?? 0) === 0 && (
        <Card>
          <div className="text-sm text-gray-600">
            No hay movimientos con estos filtros.
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Probá limpiar filtros o cambiar de mes.
          </div>
          {activeFiltersCount > 0 && (
            <div className="mt-3">
              <button
                className="rounded-lg px-3 py-2 text-sm bg-gray-100"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </Card>
      )}

      {/* List */}
      {!isLoading && !error && (filtered?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <div className="px-1 text-xs text-gray-500">
            Mostrando {filtered.length} movimiento(s)
          </div>

          {filtered.map((tx) => {
            const category = categoriesMap[tx.categoryId];
            const categoryName = category?.name ?? "Sin categoría";
            const categoryColor = category?.colorHex ?? "#9CA3AF"; // gray-400 fallback

            const accountName =
              tx.type === "EXPENSE"
                ? accountsMap[tx.sourceAccountId]?.name
                : accountsMap[tx.destinationAccountId]?.name;

            return (
              <button
                key={tx.id}
                type="button"
                className="w-full text-left"
                onClick={() => navigate(`/app/transactions/${tx.id}`)}
              >
                <Card className="flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0">
                    {/* Título + dot */}
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColor }}
                      />

                      <div className="text-sm font-semibold truncate">
                        {tx.description?.trim() || categoryName}
                      </div>
                    </div>

                    {/* Fecha */}
                    <div className="mt-1 text-xs text-gray-500">
                      {formatShortDate(tx.operationDate)}
                    </div>

                    {/* Categoría • Cuenta */}
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {categoryName}
                      {" • "}
                      {accountName || "Cuenta"}
                    </div>
                  </div>

                  {/* Monto */}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
