import { NavLink } from "react-router-dom";

const linkBase =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs";
const active = "text-black";
const inactive = "text-gray-500";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-md px-2">
        <NavLink
          to="/app/home"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <span>🏠</span>
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/app/transactions"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <span>📄</span>
          <span>Mov.</span>
        </NavLink>

        <NavLink
          to="/app/transactions/new"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            +
          </span>
          <span>Nuevo</span>
        </NavLink>

        <NavLink
          to="/app/accounts"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <span>💳</span>
          <span>Cuentas</span>
        </NavLink>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <span>⚙️</span>
          <span>Ajustes</span>
        </NavLink>
      </div>
    </nav>
  );
}
