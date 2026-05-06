const VARIANTS = {
  info:    'bg-ap-blue-light text-ap-blue border-l-4 border-ap-blue-mid',
  success: 'bg-ap-green-light text-ap-green border-l-4 border-ap-green',
  warning: 'bg-ap-gold-light text-yellow-800 border-l-4 border-ap-gold',
  danger:  'bg-ap-red-light text-ap-red border-l-4 border-ap-red',
};

export default function Alert({ variant = 'info', children, className = '' }) {
  return (
    <div className={`px-4 py-3 rounded-sm text-sm flex items-start gap-2 ${VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}
