import { NavLink } from "react-router-dom";
import { Home, FileText, CreditCard, Settings, Plus } from "lucide-react";

const linkBase =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]";
const active = "text-black";
const inactive = "text-gray-500";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-100 backdrop-blur bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-16 max-w-md px-2">
        <NavLink
          to="/app/home"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          {({ isActive }) => (
            <>
              <Home
                size={20}
                strokeWidth={2}
                className={isActive ? "text-black" : "text-gray-500"}
              />
              <span>Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/app/transactions"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          {({ isActive }) => (
            <>
              <FileText
                size={20}
                strokeWidth={2}
                className={isActive ? "text-black" : "text-gray-500"}
              />
              <span>Mov.</span>
            </>
          )}
        </NavLink>

        {/* Botón central */}
        <NavLink
          to="/app/transactions/new"
          className={() => "flex flex-1 items-center justify-center"}
          aria-label="Nuevo movimiento"
        >
          <div className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg">
            <Plus size={24} strokeWidth={2.5} className="text-white" />
          </div>
        </NavLink>

        <NavLink
          to="/app/accounts"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          {({ isActive }) => (
            <>
              <CreditCard
                size={20}
                strokeWidth={2}
                className={isActive ? "text-black" : "text-gray-500"}
              />
              <span>Cuentas</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                size={20}
                strokeWidth={2}
                className={isActive ? "text-black" : "text-gray-500"}
              />
              <span>Ajustes</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
