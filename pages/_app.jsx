// pages/_app.jsx
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "../components/Layout";
import Nav    from "../components/Nav";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>ContestPulse</title>
        <meta
          name="description"
          content="Track coding contests across Codeforces, LeetCode, CodeChef and more."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Nav />
        <Component {...pageProps} key={router.asPath} />
      </Layout>
    </>
  );
}

export default MyApp;
