import { Card, CardContent } from '@/components/ui/molecules';

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences de notifications par email et in-app.
        </p>
      </div>

      <Card
        title="Préférences de notifications"
        description="Choisissez les types de notifications que vous souhaitez recevoir."
      >
        <CardContent className="p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            La configuration des notifications sera disponible prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
