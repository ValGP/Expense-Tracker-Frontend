import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export default function NewTransactionPage() {
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="text-lg font-semibold">Nuevo movimiento</div>
        <Input label="Monto" placeholder="0" />
        <Input label="Descripción" placeholder="Ej: Supermercado" />
        <Button>Guardar</Button>
      </Card>
    </div>
  );
}
