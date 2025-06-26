// components/Layout.jsx
import { Sora } from "next/font/google";
import Head from "next/head";

import ParticlesContainer from "./ParticlesContainer";
import TopLeftImg         from "./TopLeftImg";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export default function Layout({ children }) {
  return (
    <main
      className={`
        page bg-site text-white bg-cover bg-no-repeat
        ${sora.variable} font-sora relative
      `}
    >
      <Head>
        <title>Contest Pulse</title>
        <meta
          name="description"
          content="Track coding contests across Codeforces, LeetCode, CodeChef and more."
        />
        <meta name="theme-color" content="#f13024" />
      </Head>

      {/* decorative corner image */}
      <TopLeftImg />

      {/* page body supplied by _app.jsx */}
      {children}

      {/* global spider-web overlay (drawn LAST → on top) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <ParticlesContainer />
      </div>
    </main>
  );
}
