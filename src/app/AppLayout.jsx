import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

const titles = {
  "/app/settings": "Ajustes",
  "/app/settings/categories": "Categorías",
  "/app/settings/categories/new": "Nueva categoría",
  "/app/settings/tags": "Tags",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  // 👉 solo mostrar top bar en subrutas de settings
  const showTopBar =
    path.startsWith("/app/settings/") && path !== "/app/settings";

  const title = titles[path] ?? "Ajustes";

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Top bar SOLO para sub-settings */}
      {showTopBar && (
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
      )}

      {/* Content */}
      <main className="mx-auto max-w-md p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
