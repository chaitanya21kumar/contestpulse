// components/Nav.jsx
import Link from "next/link";
import { useRouter } from "next/router";

const platforms = [
  { name: "All",        key: "all" },      // shows every contest
  { name: "Codeforces", key: "codeforces"},
  { name: "LeetCode",   key: "leetcode"  },
  { name: "CodeChef",   key: "codechef"  },
  { name: "AtCoder",    key: "atcoder"   },
  { name: "HackerRank", key: "hackerrank"},
  { name: "HackerEarth",key: "hackerearth"},
];

export default function Nav() {
  const router = useRouter();
  const active = (router.query.platform ?? "all").toString().toLowerCase();

  const linkClasses = (key) =>
    `whitespace-nowrap transition-colors duration-150
     ${key === active ? "text-accent" : "text-white/70 hover:text-accent"}`;

  return (
    <nav className="fixed top-0 z-50 w-full bg-primary/30 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
        {/* --- brand --- */}
        <Link href="/" legacyBehavior>
          <a className="font-semibold text-lg md:text-xl">
            Contest<span className="text-accent">Pulse</span>
          </a>
        </Link>

        {/* --- platform buttons --- */}
        <ul className="flex flex-wrap gap-4 md:gap-6">
          {platforms.map(({ name, key }) => (
            <li key={key}>
              <Link
                href={{
                  pathname: "/",
                  query: key === "all" ? {} : { platform: key },
                }}
                scroll={false}
                legacyBehavior
              >
                <a className={linkClasses(key)}>{name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
