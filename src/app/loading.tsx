export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-300 border-t-foreground mb-4"></div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Chargement...
        </p>
      </div>
    </div>
  );
}
