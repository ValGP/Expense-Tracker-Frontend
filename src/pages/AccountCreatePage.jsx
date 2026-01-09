import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { getApiErrorMessage } from "../api/errorMessage";
import { useCreateAccount } from "../hooks/useAccountsCrud";

const ACCOUNT_TYPES = [
  "CASH",
  "BANK",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "DIGITAL_WALLET",
];

export default function AccountCreatePage() {
  const navigate = useNavigate();
  const create = useCreateAccount();

  const [name, setName] = useState("");
  const [type, setType] = useState("DIGITAL_WALLET");
  const [currencyCode, setCurrencyCode] = useState("ARS");
  const [initialBalance, setInitialBalance] = useState("0");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({
        name: name.trim(),
        type,
        currencyCode: currencyCode.trim().toUpperCase(),
        initialBalance: initialBalance, // BigDecimal como string ok
      });
      navigate("/app/accounts", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">Nueva cuenta</div>

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

        <label className="block">
          <span className="mb-1 block text-sm text-gray-700">Tipo</span>
          <select
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-gray-400"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Moneda (ISO)"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          placeholder="ARS"
        />

        <Input
          label="Saldo inicial"
          inputMode="decimal"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
        />

        <Button disabled={create.isPending || !name.trim()}>
          {create.isPending ? "Creando..." : "Crear"}
        </Button>

        <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </form>
    </Card>
  );
}
