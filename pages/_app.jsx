// pages/_app.jsx
import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

import Layout from "../components/Layout";
import Nav from "../components/Nav";          // ← only here
import Transition from "../components/Transition";

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
        <Nav />                               {/* ONE bar */}
        <AnimatePresence mode="wait">
          <motion.div key={router.route} className="h-full">
            <Transition />
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </Layout>
    </>
  );
}

export default MyApp;
