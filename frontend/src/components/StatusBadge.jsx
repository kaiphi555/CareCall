export default function StatusBadge({ status, size = 'md' }) {
  const styles = {
    taken: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    missed: 'bg-red-500/15 text-red-400 border-red-500/20',
    upcoming: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    high: 'bg-red-500/15 text-red-400 border-red-500/20',
    scheduled: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  const key = status?.toLowerCase() || 'upcoming';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium capitalize ${styles[key] || styles.upcoming} ${sizes[size]}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
