import { API_BASE_URL } from "./api/env";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-9xl font-bold text-blue-800 p-4">ExpenseTracker</h1>
      <p>API Base URL: {API_BASE_URL}</p>
      <h1 className="text-9xl font-bold text-blue-500">Hola</h1>
    </div>
  );
}
