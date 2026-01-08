import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

const titles = {
  "/app/home": "Resumen",
  "/app/transactions": "Movimientos",
  "/app/transactions/new": "Nuevo",
  "/app/accounts": "Cuentas",
  "/app/settings": "Ajustes",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] ?? "ExpenseTracker";

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-14 max-w-md items-center px-4">
          <button
            className="mr-3 rounded-lg px-2 py-1 text-sm text-gray-600"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-md p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
