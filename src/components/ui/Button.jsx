export default function Button({ children, ...props }) {
  return (
    <button {...props} className="px-4 py-2 rounded bg-blue-500 text-white">
      {children}
    </button>
  );
}