import { Card } from "../components/Card";

export default function AccountsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="text-lg font-semibold">Cuentas</div>
        <div className="mt-2 text-sm text-gray-500">
          Lista vacía (skeleton).
        </div>
      </Card>
    </div>
  );
}
