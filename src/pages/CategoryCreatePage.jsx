import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useCreateCategory } from "../hooks/useCategoriesCrud";
import { getApiErrorMessage } from "../api/errorMessage";

export default function CategoryCreatePage() {
  const navigate = useNavigate();
  const create = useCreateCategory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [colorHex, setColorHex] = useState("#3b82f6");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        colorHex,
      });
      navigate("/app/settings/categories", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">New category</div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
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

        <Button disabled={create.isPending || !name.trim()}>
          {create.isPending ? "Creating..." : "Create"}
        </Button>

        <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </form>
    </Card>
  );
}
