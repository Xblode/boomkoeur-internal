'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules';
import { AlertCircle, CheckCircle2, Loader2, Play } from 'lucide-react';
import { migrateToBase64Codes } from '@/lib/utils/migrations/migrateToBase64Codes';

interface MigrationResult {
  success: boolean;
  invoicesMigrated: number;
  ordersMigrated: number;
  transactionsMigrated: number;
  errors: string[];
}

export default function MigrationPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const migrationResult = await migrateToBase64Codes();
      setResult(migrationResult);
    } catch (error) {
      setResult({
        success: false,
        invoicesMigrated: 0,
        ordersMigrated: 0,
        transactionsMigrated: 0,
        errors: [`Erreur critique: ${error}`],
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-2">Migration des codes d'identification</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Cette migration va convertir tous les anciens codes séquentiels vers le nouveau format base64 :
            </p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 ml-4">
              <li>• <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">FAC-2026-001</code> → <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">FAC-A3F2B1K2</code></li>
              <li>• <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">CMD-2026-0001</code> → <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">CMD-K7P2Q8R5</code></li>
              <li>• <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">2025-0001</code> → <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">TRA-B6N1C4D9</code></li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            ⚠️ Attention : Cette opération va modifier toutes les données existantes. 
            Assurez-vous d'avoir une sauvegarde avant de continuer.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={runMigration}
          disabled={isRunning}
          className="w-full mb-6"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Migration en cours...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Lancer la migration
            </>
          )}
        </Button>

        {result && (
          <div className={`border rounded-lg p-4 ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${
                  result.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {result.success ? 'Migration réussie !' : 'Migration avec erreurs'}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-700 dark:text-zinc-300">
                    📄 Factures/Devis migrées : <strong>{result.invoicesMigrated}</strong>
                  </p>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    📦 Commandes migrées : <strong>{result.ordersMigrated}</strong>
                  </p>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    💰 Transactions migrées : <strong>{result.transactionsMigrated}</strong>
                  </p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Erreurs détectées :
                </p>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="font-mono">• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
          <p>
            💡 Vous pouvez aussi exécuter la migration depuis la console du navigateur en tapant :
          </p>
          <code className="block mt-2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
            window.__migrateToBase64Codes()
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
