import MigrationPanel from '@/components/feature/Backend/Admin/MigrationPanel';

export default function MigrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Migration des données</h1>
        <p className="text-muted-foreground">
          Convertir les codes d&apos;identification au nouveau format base64
        </p>
      </div>
      <MigrationPanel />
    </div>
  );
}
