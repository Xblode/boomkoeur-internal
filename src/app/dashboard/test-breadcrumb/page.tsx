export default function TestBreadcrumbPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Test Breadcrumb
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Cette page teste le breadcrumb automatique.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold mb-4">Le breadcrumb devrait afficher :</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          <strong>Dashboard &gt; Test breadcrumb</strong>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-4">
          Le label "Test breadcrumb" est généré automatiquement depuis l'URL, 
          sans avoir besoin de le définir dans navigation.ts
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
        <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          Comment ça marche ?
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>✅ Le breadcrumb parse automatiquement l'URL</li>
          <li>✅ Il cherche d'abord dans <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs">navigation.ts</code></li>
          <li>✅ Si pas trouvé, il génère un label lisible (ex: "test-breadcrumb" → "Test breadcrumb")</li>
          <li>✅ Plus besoin de mettre à jour manuellement pour chaque nouvelle page !</li>
        </ul>
      </div>
    </div>
  );
}
