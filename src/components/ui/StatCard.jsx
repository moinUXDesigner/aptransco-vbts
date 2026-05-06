export default function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-white rounded-lg border border-ap-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold text-ap-gray-400 uppercase tracking-wide">{label}</div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold mt-1 mb-0.5 font-sans ${accent || 'text-ap-blue'}`}>{value}</div>
      {sub && <div className="text-xs text-ap-gray-600">{sub}</div>}
    </div>
  );
}
