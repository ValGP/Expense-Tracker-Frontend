import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Loader } from "../components/Loader";
import { ConfirmDialog } from "../components/ConfirmDialog";

import { getApiErrorMessage } from "../api/errorMessage";
import { useAccounts, useCategories } from "../hooks/useLookups";
import {
  useCancelTransaction,
  useTransactionById,
  useUpdateTransaction,
} from "../hooks/useTransactionDetail";

import { formatShortDate } from "../utils/date";

function money(value, currency = "ARS") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [description, setDescription] = useState("");
  const [operationDate, setOperationDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

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

  // initialize form when tx arrives (once per id)
  useEffect(() => {
    if (!tx) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDescription(tx.description ?? "");
    setOperationDate(tx.operationDate ?? "");
    setCategoryId(tx.categoryId ? String(tx.categoryId) : "");
  }, [tx?.id]);

  if (txQ.isLoading) return <Loader text="Loading transaction..." />;

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
            Back to Transactions
          </Button>
        </div>
      </Card>
    );
  }

  const category = categoriesMap[tx.categoryId];
  const categoryName = category?.name ?? "Uncategorized";
  const categoryColor = category?.colorHex ?? "#9CA3AF";

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
        },
      });
      setEditMode(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function confirmCancel() {
    setError("");

    try {
      await cancelM.mutateAsync(tx.id);
      navigate("/app/transactions", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    // pb-44 so nothing gets covered by BottomNav + sticky actions
    <div className="pb-44">
      {/* App-style header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm hover:bg-gray-100"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={18} />
          <span className="font-medium">Details</span>
        </button>

        <div className="text-xs text-gray-500">
          {formatShortDate(tx.operationDate)}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <Card className="mt-3">
          <div className="text-sm text-red-700">{error}</div>
        </Card>
      )}

      {!editMode ? (
        <div className="mt-3 space-y-4">
          {/* Hero: amount + meta */}
          <Card className="space-y-3">
            <div className="text-3xl font-semibold tracking-tight">
              {sign} {money(tx.amount)}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: categoryColor }}
              />
              <div className="truncate">
                {categoryName}
                {" • "}
                {accountName || "Account"}
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card className="space-y-3">
            {tx.description?.trim() ? (
              <div>
                <div className="text-xs text-gray-500">Description</div>
                <div className="text-sm font-medium">
                  {tx.description.trim()}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Category</div>
                <div className="text-sm font-medium truncate">
                  {categoryName}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Account</div>
                <div className="text-sm font-medium truncate">
                  {accountName || "Account"}
                </div>
              </div>
            </div>
          </Card>

          {/* Sticky actions ABOVE BottomNav */}
          <div className="fixed inset-x-0 bottom-20 bg-white/90 backdrop-blur px-4 py-3">
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setEditMode(true)}>
                Edit transaction
              </Button>

              <button
                type="button"
                className="w-full text-center text-sm font-medium text-red-600 py-2"
                onClick={() => setConfirmOpen(true)}
                disabled={cancelM.isPending}
              >
                {cancelM.isPending ? "Canceling..." : "Cancel transaction"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <Card className="space-y-3">
            <div className="text-lg font-semibold">Edit transaction</div>

            <form className="space-y-3" onSubmit={handleSave}>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
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
                  Category
                </span>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {(categoriesQ.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <Button disabled={updateM.isPending} className="w-full">
                {updateM.isPending ? "Saving..." : "Save changes"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setEditMode(false);
                  setError("");
                  setDescription(tx.description ?? "");
                  setOperationDate(tx.operationDate ?? "");
                  setCategoryId(tx.categoryId ? String(tx.categoryId) : "");
                }}
              >
                Cancel
              </Button>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this transaction?"
        message="This action can’t be undone."
        confirmText="Cancel"
        cancelText="Keep"
        destructive
        loading={cancelM.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          confirmCancel();
        }}
      />
    </div>
  );
}
