export function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
      <div className="h-4 w-1/3 rounded bg-gray-100" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
      <div className="mt-3 h-4 w-1/4 rounded bg-gray-100" />
    </div>
  );
}
