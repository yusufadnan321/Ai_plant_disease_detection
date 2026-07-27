import { useRouter } from '@/context/RouterContext';

export default function LinkButton({ to, variant = 'primary', className = '', children, onClick, ...props }) {
  const { navigate } = useRouter();

  const variantClass =
    variant === 'secondary' ? 'btn-secondary' : variant === 'ghost' ? 'btn-ghost' : 'btn-primary';

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && to) navigate(to);
  };

  return (
    <button className={`${variantClass} ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
