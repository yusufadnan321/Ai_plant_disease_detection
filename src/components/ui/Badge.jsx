export function Badge({ children, color = 'gray', className = '' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    green: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    earth: 'bg-earth-100 text-earth-700 dark:bg-earth-900/40 dark:text-earth-300',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors[color] || colors.gray} ${className}`}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    Low: { color: 'green', dot: 'bg-brand-500' },
    Medium: { color: 'amber', dot: 'bg-amber-500' },
    High: { color: 'red', dot: 'bg-red-500' },
  };
  const cfg = map[severity] || map.Low;
  return (
    <Badge color={cfg.color}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {severity} Severity
    </Badge>
  );
}

export function HealthBadge({ isHealthy }) {
  return isHealthy ? (
    <Badge color="green">Healthy</Badge>
  ) : (
    <Badge color="red">Diseased</Badge>
  );
}
