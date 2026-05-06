export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded border-0 cursor-pointer transition-all duration-150 font-sans';
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  const variants = {
    primary:   'bg-ap-blue-mid text-white hover:bg-ap-blue',
    secondary: 'bg-white text-ap-blue-mid border border-ap-blue-mid hover:bg-ap-blue-light',
    success:   'bg-ap-green text-white hover:opacity-90',
    warning:   'bg-ap-gold text-ap-blue hover:opacity-90',
    danger:    'bg-ap-red text-white hover:opacity-90',
    outline:   'bg-transparent text-ap-blue-mid border border-ap-blue-mid hover:bg-ap-blue-light',
    ghost:     'bg-transparent text-ap-gray-600 hover:bg-ap-gray-100',
  };
  const disabledCls = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabledCls} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
