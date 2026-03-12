import { Card } from '@/components/ui/molecules';
import { PushNotificationToggle } from '@/components/feature/Backend/Settings';

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
        variant="settings"
        title="Notifications push"
        description="Recevez des alertes sur vos appareils quand vous recevez des messages."
      >
        <div className="p-4">
          <PushNotificationToggle />
        </div>
      </Card>
    </div>
  );
}
