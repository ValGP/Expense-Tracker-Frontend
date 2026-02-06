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
    // sort by recordedAt desc (fallback to operationDate)
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

  if (isLoading) return <Loader text="Loading summary..." />;

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

  // sum of top categories
  const topSum = top.reduce((acc, c) => acc + Number(c.total ?? 0), 0);

  // “Other” = totalExpense - topSum
  const others = Math.max(0, totalExpenseNum - topSum);

  // Donut items (top + other)
  const donutItems = [
    ...top.map((c) => {
      const name =
        c.categoryName ||
        categoriesMap?.[c.categoryId]?.name ||
        "Uncategorized";
      const color = categoriesMap?.[c.categoryId]?.colorHex;

      return {
        label: name,
        value: c.total, // can be BigDecimal string
        color,
        _key: `cat-${c.categoryId}`,
      };
    }),
    ...(others > 0
      ? [
          {
            label: "Other",
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
          <div className="text-lg font-semibold">Overview</div>
          <div className="text-xs text-gray-500">
            {formatMonthLabel(monthDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthDate((d) => addMonths(d, -1))}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => setMonthDate((d) => addMonths(d, 1))}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="space-y-3">
        {/* Main balance */}
        <StatCard
          title="Net balance"
          value={money(summary?.net)}
          className="py-4 text-center"
          valueClassName="text-4xl"
          titleClassName="text-sm text-gray-500"
        />

        {/* Expenses / Income */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Monthly expenses"
            value={money(summary?.totalExpense)}
            className="py-4"
            valueClassName="text-xl"
          />
          <StatCard
            title="Monthly income"
            value={money(summary?.totalIncome)}
            className="py-4"
            valueClassName="text-xl"
          />
        </div>
      </div>

      {/* Expense breakdown */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Expense breakdown</div>
          <button
            className="text-sm text-gray-600"
            onClick={() => navigate("/app/transactions")}
          >
            View
          </button>
        </div>

        <div className="mt-3">
          <ExpenseDonut
            items={donutItems}
            totalLabel="Expenses"
            totalValue={money(summary?.totalExpense)}
            height={190}
          />
        </div>

        {/* Mini legend */}
        <div className="mt-3 space-y-2">
          {donutItems.length === 0 ? (
            <div className="text-sm text-gray-600">
              No confirmed expenses in this period.
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

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Recent activity</div>
          <button
            className="text-sm text-gray-600"
            onClick={() => navigate("/app/transactions")}
          >
            View all
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {lastTx.length === 0 ? (
            <div className="text-sm text-gray-600">
              You haven’t added any transactions yet.
            </div>
          ) : (
            lastTx.map((tx) => {
              const categoryName =
                categoriesMap[tx.categoryId]?.name ?? "Uncategorized";

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
                        {accountName || "Account"} •{" "}
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
            + New transaction
          </Button>
        </div>
      </Card>
    </div>
  );
}
