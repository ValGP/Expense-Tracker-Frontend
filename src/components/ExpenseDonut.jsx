import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function normalizeHex(hex) {
  if (!hex) return null;
  const h = hex.trim();
  return h.startsWith("#") ? h : `#${h}`;
}

export function ExpenseDonut({
  items = [], // [{ label, value, color }]
  totalLabel = "Gastos",
  totalValue = 0,
  height = 180,
}) {
  const data = items
    .filter((x) => Number(x.value) > 0)
    .map((x) => ({
      name: x.label,
      value: Number(x.value),
      color: normalizeHex(x.color) ?? "#9CA3AF", // gray-400 fallback
    }));

  const hasData = data.length > 0;

  return (
    <div className="relative" style={{ height }}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={2}
              stroke="transparent"
              isAnimationActive={false} // MVP: sin animaciones raras
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        // Placeholder cuando no hay datos
        <div className="h-full w-full rounded-2xl bg-gray-100" />
      )}

      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs text-gray-500">{totalLabel}</div>
        <div className="text-lg font-semibold text-gray-900">{totalValue}</div>
      </div>
    </div>
  );
}
