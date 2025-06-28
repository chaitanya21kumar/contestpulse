import { Sora }      from "next/font/google";
import Head          from "next/head";
import { useRouter } from "next/router";

import ParticlesContainer from "./ParticlesContainer";
import TopLeftImg         from "./TopLeftImg";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export default function Layout({ children }) {
  const { query } = useRouter();
  const isHero    = query.platform === undefined;   // landing page

  /* One base colour everywhere: pure charcoal bg-primary */
  return (
    <main
      className={`
        page bg-primary text-white bg-cover bg-no-repeat
        ${sora.variable} font-sora relative
      `}
    >
      <Head>
        <title>Contest Pulse</title>
        <meta name="description" content="Track coding contests across Codeforces, LeetCode, CodeChef and more." />
        <meta name="theme-color" content="#0d0d0d" />
      </Head>

      {/* red/orange corner splash only on landing hero */}
      {isHero && <TopLeftImg />}

      {/* page body from _app.jsx */}
      {children}

      {/* spider-web overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <ParticlesContainer />
      </div>
    </main>
  );
}
