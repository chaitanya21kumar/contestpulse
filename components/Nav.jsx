// components/Nav.jsx
import Link from "next/link";
import { useRouter } from "next/router";

const platforms = [
  { name: "All",        key: "all",       href: "/"                   },
  { name: "Codeforces", key: "codeforces",href: "/?platform=codeforces"},
  { name: "LeetCode",   key: "leetcode",  href: "/?platform=leetcode"  },
  { name: "CodeChef",   key: "codechef",  href: "/?platform=codechef"  },
  { name: "AtCoder",    key: "atcoder",   href: "/?platform=atcoder"   },
];

export default function Nav() {
  const { query } = useRouter();
  // if no query.platform, treat as "all"
  const active = (query.platform ?? "all").toString().toLowerCase();

  return (
    <nav className="fixed top-0 z-50 w-full bg-primary/30 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
        <Link href="/" legacyBehavior>
          <a className="font-semibold text-lg md:text-xl text-white">
            Contest<span className="text-accent">Pulse</span>
          </a>
        </Link>

        <ul className="flex flex-wrap gap-4 md:gap-6">
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
        </ul>
      </div>
    </nav>
  );
}
