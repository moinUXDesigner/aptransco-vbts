export default function SectionCard({ title, headerRight, children, noPad }) {
  return (
    <div className="bg-white rounded-lg border border-ap-gray-200 shadow-sm mb-5 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-ap-gray-100">
          <h3 className="text-sm font-bold text-ap-blue">{title}</h3>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
