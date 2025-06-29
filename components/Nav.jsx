// components/Nav.jsx

import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const platforms = [
  { name: "Home",       key: "home",       href: "/" },
  { name: "All",        key: "all",        href: "/?platform=all" },
  { name: "Codeforces", key: "codeforces", href: "/?platform=codeforces" },
  { name: "LeetCode",   key: "leetcode",   href: "/?platform=leetcode" },
  { name: "CodeChef",   key: "codechef",   href: "/?platform=codechef" },
  { name: "AtCoder",    key: "atcoder",    href: "/?platform=atcoder" },
  { name: "Pulse+",     key: "pulseplus",  href: "/pulseplus" }  // 👈 new button
];

export default function Nav() {
  const { query, push } = useRouter();
  const active = (query.platform ?? "home").toString().toLowerCase();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    push("/");
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-primary/30 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
        <Link href="/" legacyBehavior>
          <a className="font-semibold text-lg md:text-xl text-white">
            Contest<span className="text-accent">Pulse</span>
          </a>
        </Link>

        <ul className="flex flex-wrap gap-4 md:gap-6 items-center">
          {platforms.map(({ name, key, href }) => (
            <li key={key}>
              <Link href={href} scroll={false} legacyBehavior>
                <a
                  className={`whitespace-nowrap transition-colors duration-150 ${
                    key === active
                      ? "text-accent"
                      : "text-white/70 hover:text-accent"
                  }`}
                >
                  {name}
                </a>
              </Link>
            </li>
          ))}

          {!user ? (
            <>
              <li>
                <Link href="/login" legacyBehavior>
                  <a className="whitespace-nowrap text-white/70 hover:text-accent">Log In</a>
                </Link>
              </li>
              <li>
                <Link href="/signup" legacyBehavior>
                  <a className="whitespace-nowrap text-white/70 hover:text-accent">Sign Up</a>
                </Link>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="whitespace-nowrap text-white/70 hover:text-accent"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
