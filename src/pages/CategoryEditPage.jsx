import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { useCategories } from "../hooks/useLookups";
import { useUpdateCategory } from "../hooks/useCategoriesCrud";
import { getApiErrorMessage } from "../api/errorMessage";

export default function CategoryEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const categoryId = Number(id);

  const q = useCategories();
  const update = useUpdateCategory();

  const category = useMemo(() => {
    return (q.data ?? []).find((c) => c.id === categoryId) || null;
  }, [q.data, categoryId]);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [colorHex, setColorHex] = useState("#3b82f6");
  const [active, setActive] = useState(true);

  // Inicializar form cuando llegue category
  useEffect(() => {
    if (!category) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName((prev) => {
      const next = category.name ?? "";
      return prev === next ? prev : next;
    });
    setDescription((prev) => {
      const next = category.description ?? "";
      return prev === next ? prev : next;
    });
    setColorHex((prev) => {
      const next = category.colorHex ?? "#3b82f6";
      return prev === next ? prev : next;
    });
    setActive((prev) => {
      const next = !!category.active;
      return prev === next ? prev : next;
    });
  }, [category]);

  if (q.isLoading) return <Loader text="Cargando..." />;
  if (q.error)
    return (
      <Card>
        <div className="text-sm text-red-700">
          {getApiErrorMessage(q.error)}
        </div>
      </Card>
    );
  if (!category)
    return (
      <Card>
        <div className="text-sm text-gray-600">Categoría no encontrada.</div>
      </Card>
    );

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await update.mutateAsync({
        id: categoryId,
        payload: {
          name: name.trim() || null,
          description: description.trim() || null,
          colorHex,
          active,
        },
      });
      navigate("/app/settings/categories", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">Editar categoría</div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">Color</span>
          <input
            type="color"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Activa
        </label>

        <Button disabled={update.isPending || !name.trim()}>
          {update.isPending ? "Guardando..." : "Guardar"}
        </Button>

        <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </form>
    </Card>
  );
}
