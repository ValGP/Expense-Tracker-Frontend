import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { getApiErrorMessage } from "../api/errorMessage";
import { useCategories } from "../hooks/useLookups";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const q = useCategories();

  if (q.isLoading) return <Loader text="Cargando categorías..." />;

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
        <div className="text-lg font-semibold">Categorías</div>
        <button
          onClick={() => navigate("/app/settings/categories/new")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-xl"
          aria-label="Agregar"
        >
          +
        </button>
      </Card>

      {categories.length === 0 ? (
        <Card>
          <div className="text-sm text-gray-600">
            No tenés categorías todavía.
          </div>
          <div className="mt-2">
            <Button onClick={() => navigate("/app/settings/categories/new")}>
              Crear primera categoría
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
                  {c.active ? "Activa" : "Archivada"}
                </div>
              </div>

              <button
                className="rounded-lg px-3 py-2 text-sm bg-gray-100"
                onClick={() => navigate(`/app/settings/categories/${c.id}`)}
              >
                Editar
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
