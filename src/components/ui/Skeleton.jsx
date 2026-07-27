export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-6">
      <SkeletonBox className="mb-4 h-10 w-10 rounded-xl" />
      <SkeletonBox className="mb-2 h-5 w-3/4" />
      <SkeletonBox className="mb-3 h-4 w-full" />
      <SkeletonBox className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonCropCard() {
  return (
    <div className="card overflow-hidden">
      <SkeletonBox className="h-44 w-full rounded-none" />
      <div className="p-5">
        <SkeletonBox className="mb-2 h-5 w-1/2" />
        <SkeletonBox className="h-4 w-3/4" />
      </div>
    </div>
  );
}
