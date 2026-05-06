export default function Toast({ msg, isError }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all
      ${isError ? 'bg-danger-600 text-white' : 'bg-ap-blue text-white'}`}>
      <span>{isError ? '⚠️' : '✅'}</span>
      <span>{msg}</span>
    </div>
  );
}
