export default function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-white rounded-lg border border-ap-gray-200 shadow-sm px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-ap-gray-400 uppercase tracking-wide leading-none">{label}</div>
        {icon && <span className="text-base leading-none">{icon}</span>}
      </div>
      <div className={`text-xl font-bold font-sans leading-tight ${accent || 'text-ap-blue'}`}>{value}</div>
      {sub && <div className="text-xs text-ap-gray-500 mt-0.5 leading-tight">{sub}</div>}
    </div>
  );
}
