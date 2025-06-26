import { Sora } from "next/font/google";
import Head from "next/head";

import TopLeftImg from "./TopLeftImg";      // keep or remove as you wish

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
        <meta name="description"
              content="Track coding contests across Codeforces, LeetCode, CodeChef and more." />
        <meta name="theme-color" content="#f13024" />
      </Head>

      {/* Optional decorative corner graphic */}
      <TopLeftImg />

      {/* body supplied by _app.jsx (Nav + pages) */}
      {children}
    </main>
  );
}
