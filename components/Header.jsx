// components/Header.jsx
export default function Header() {
  return (
    <header className="absolute left-0 top-0 z-20 px-6 py-4">
      {/* Logo / word-mark */}
      <h1 className="text-xl font-semibold tracking-tight">
        <span className="text-white">Contest</span>
        <span className="text-accent">Pulse</span>
      </h1>
    </header>
  );
}
