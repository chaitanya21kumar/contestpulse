// components/Navbar.jsx
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav
      className="
        fixed inset-x-0 top-0 z-50
        bg-black/30         /* translucent dark film */
        backdrop-blur-md    /* subtle frosted-glass effect */
        shadow-sm
      "
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* logo / title */}
        <Link href="/" className="text-lg font-semibold tracking-wide text-white">
          Contest&nbsp;Pulse
        </Link>

        {/* (stub) nav links – add or edit as you expand */}
        <ul className="flex items-center gap-6 text-sm font-medium text-gray-200">
          <li>
            <Link href="#features" className="transition-opacity hover:opacity-80">
              Features
            </Link>
          </li>
          <li>
            <Link href="#contests" className="transition-opacity hover:opacity-80">
              Upcoming Contests
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
