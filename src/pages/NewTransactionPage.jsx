import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { getApiErrorMessage } from "../api/errorMessage";
import { useAccounts, useCategories, useTags } from "../hooks/useLookups";
import { useCreateExpense, useCreateIncome } from "../hooks/useTransactions";
import { formatISODate } from "../utils/date";

export default function NewTransactionPage() {
  const navigate = useNavigate();

  const [type, setType] = useState("EXPENSE"); // EXPENSE | INCOME
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [operationDate, setOperationDate] = useState(formatISODate(new Date()));

  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState([]);

  const [error, setError] = useState("");

  const accountsQ = useAccounts();
  const categoriesQ = useCategories();
  const tagsQ = useTags();

  const createExpense = useCreateExpense();
  const createIncome = useCreateIncome();

  const isLoading =
    accountsQ.isLoading ||
    categoriesQ.isLoading ||
    tagsQ.isLoading ||
    createExpense.isPending ||
    createIncome.isPending;

  const accounts = accountsQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const tags = tagsQ.data ?? [];

  const [autoAccountDone, setAutoAccountDone] = useState(false);
  const [autoCategoryDone, setAutoCategoryDone] = useState(false);

  useEffect(() => {
    const list = accountsQ.data;
    if (autoAccountDone) return;

    if (!accountId && Array.isArray(list) && list.length === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccountId(String(list[0].id));
    }

    setAutoAccountDone(true);
  }, [accountsQ.data, accountId, autoAccountDone]);

  useEffect(() => {
    const list = categoriesQ.data;
    if (autoCategoryDone) return;

    if (!categoryId && Array.isArray(list) && list.length === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoryId(String(list[0].id));
    }

    setAutoCategoryDone(true);
  }, [categoriesQ.data, categoryId, autoCategoryDone]);

  const canSubmit = useMemo(() => {
    const a = Number(amount);
    return (
      !isLoading &&
      amount !== "" &&
      !Number.isNaN(a) &&
      a > 0 &&
      accountId &&
      categoryId &&
      operationDate
    );
  }, [amount, accountId, categoryId, operationDate, isLoading]);

  function toggleTag(id) {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const payloadCommon = {
        categoryId: Number(categoryId),
        amount: amount, // BigDecimal: can be sent as string
        description: description || null,
        operationDate,
        tagIds: tagIds.length ? tagIds : null,
      };

      if (type === "EXPENSE") {
        await createExpense.mutateAsync({
          ...payloadCommon,
          sourceAccountId: Number(accountId),
        });
      } else {
        await createIncome.mutateAsync({
          ...payloadCommon,
          destinationAccountId: Number(accountId),
        });
      }

      navigate("/app/transactions", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="text-lg font-semibold">New transaction</div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-xl py-3 text-sm font-medium ${
              type === "EXPENSE"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setType("EXPENSE")}
          >
            Expense
          </button>

          <button
            type="button"
            className={`flex-1 rounded-xl py-3 text-sm font-medium ${
              type === "INCOME"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setType("INCOME")}
          >
            Income
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            label="Amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Description"
            placeholder="e.g. Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Date</span>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              type="date"
              value={operationDate}
              onChange={(e) => setOperationDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">
              {type === "EXPENSE" ? "Source account" : "Destination account"}
            </span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Select an account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currencyCode})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Category</span>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Tags (optional) */}
          {tags.length > 0 && (
            <div>
              <div className="mb-2 text-sm text-gray-700">Tags</div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`rounded-full px-3 py-2 text-xs ${
                        active
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button disabled={!canSubmit}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
