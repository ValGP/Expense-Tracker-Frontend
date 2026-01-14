import { Card } from "./Card";

export function StatCard({
  title,
  value,
  className = "",
  valueClassName = "",
  titleClassName = "",
}) {
  return (
    <Card className={`space-y-1 ${className}`}>
      <div className={`text-xs text-gray-500 ${titleClassName}`}>{title}</div>
      <div className={`text-2xl font-semibold ${valueClassName}`}>{value}</div>
    </Card>
  );
}
