import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { getApiErrorMessage } from "../api/errorMessage";
import { useCategories } from "../hooks/useLookups";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const q = useCategories();

  if (q.isLoading) return <Loader text="Loading categories..." />;

  if (q.error) {
    return (
      <Card>
        <div className="text-sm text-red-700">
          {getApiErrorMessage(q.error)}
        </div>
      </Card>
    );
  }

  const categories = q.data ?? [];

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div className="text-lg font-semibold">Categories</div>

        <button
          onClick={() => navigate("/app/settings/categories/new")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
          aria-label="Add category"
          type="button"
        >
          <Plus size={18} />
        </button>
      </Card>

      {categories.length === 0 ? (
        <Card>
          <div className="text-sm text-gray-600">
            You don’t have any categories yet.
          </div>
          <div className="mt-2">
            <Button onClick={() => navigate("/app/settings/categories/new")}>
              Create your first category
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.colorHex || "#999" }}
                  />
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                </div>

                {c.description && (
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {c.description}
                  </div>
                )}

                <div className="mt-1 text-xs text-gray-500">
                  {c.active ? "Active" : "Archived"}
                </div>
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"
                onClick={() => navigate(`/app/settings/categories/${c.id}`)}
                aria-label="Edit category"
                type="button"
              >
                <Pencil size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
