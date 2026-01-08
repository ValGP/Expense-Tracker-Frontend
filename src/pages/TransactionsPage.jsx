import { Card } from "../components/Card";

export default function TransactionsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="text-lg font-semibold">Movimientos</div>
        <div className="mt-2 text-sm text-gray-500">
          Lista vacía (skeleton).
        </div>
      </Card>
    </div>
  );
}
