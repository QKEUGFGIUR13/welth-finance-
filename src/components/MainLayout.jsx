export default function MainLayout({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16 min-h-screen">
      {children}
    </div>
  );
}
