// pages/_app.jsx
import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

import Layout from "../components/Layout";
import Nav from "../components/Nav";
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
        <Nav />

        <AnimatePresence mode="wait">
          {/* allow full page to grow past 100vh */}
          <motion.div key={router.route} className="min-h-full">
            <Transition />
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </Layout>
    </>
  );
}

export default MyApp;
