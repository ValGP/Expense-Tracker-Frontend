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
  // For account filtering, use the relevant account depending on the type
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

  // Base list
  const visible = useMemo(() => {
    const list = data ?? [];
    return list.filter((tx) => tx.state !== "CANCELED");
  }, [data]);

  // --------------------
  // Filters + search (state)
  // --------------------
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const [accountId, setAccountId] = useState(""); // "" = all
  const [categoryId, setCategoryId] = useState(""); // "" = all

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return (visible ?? []).filter((tx) => {
      // account
      if (accountId) {
        const txAccId = getTxAccountId(tx);
        if (String(txAccId) !== String(accountId)) return false;
      }

      // category
      if (categoryId) {
        if (String(tx.categoryId ?? "") !== String(categoryId)) return false;
      }

      // search
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
      {/* Header: month + filters button */}
      <Card className="flex items-center justify-between">
        <button
          className="rounded-lg bg-gray-100 p-2"
          onClick={prevMonth}
          aria-label="Previous month"
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
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </Card>

      {/* Filters BottomSheet */}
      <BottomSheet
        open={filtersOpen}
        title="Filters"
        onClose={() => setFiltersOpen(false)}
      >
        <div className="space-y-3">
          {/* Account */}
          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Account</span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">All</option>
              {(accountsQ.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currencyCode})
                </option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Category</span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All</option>
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
              Apply
            </button>

            <button
              type="button"
              className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700"
              onClick={clearFilters}
            >
              Clear
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
            No transactions match these filters.
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Try clearing filters or switching months.
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-3">
              <button
                className="rounded-lg px-3 py-2 text-sm bg-gray-100"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </Card>
      )}

      {/* List */}
      {!isLoading && !error && (filtered?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <div className="px-1 text-xs text-gray-500">
            Showing {filtered.length} transaction(s)
          </div>

          {filtered.map((tx) => {
            const category = categoriesMap[tx.categoryId];
            const categoryName = category?.name ?? "Uncategorized";
            const categoryColor = category?.colorHex ?? "#9CA3AF";

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
                    {/* Title + dot */}
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColor }}
                      />

                      <div className="text-sm font-semibold truncate">
                        {tx.description?.trim() || categoryName}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mt-1 text-xs text-gray-500">
                      {formatShortDate(tx.operationDate)}
                    </div>

                    {/* Category • Account */}
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {categoryName}
                      {" • "}
                      {accountName || "Account"}
                    </div>
                  </div>

                  {/* Amount */}
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
