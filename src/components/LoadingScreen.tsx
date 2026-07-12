export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="flex gap-2">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-3 w-3 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <p className="mt-5 text-muted">Crunching your workouts…</p>
    </div>
  );
}
