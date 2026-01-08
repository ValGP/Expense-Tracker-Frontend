import { Card } from "../components/Card";
import { useAuth } from "../auth/useAuth";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm text-gray-600">Bienvenido</div>
        <div className="mt-1 text-lg font-semibold">
          {user?.name ?? "Usuario"}
        </div>
        <div className="text-sm text-gray-500">{user?.email}</div>
      </Card>

      <Card>
        <div className="text-sm text-gray-600">Gastos del mes</div>
        <div className="mt-1 text-2xl font-semibold">$0</div>
      </Card>
    </div>
  );
}
