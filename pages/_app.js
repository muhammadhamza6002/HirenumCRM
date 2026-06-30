import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "../components/Layout";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (router.pathname === "/login") {
      setAuthReady(true);
      return;
    }
    const auth = sessionStorage.getItem("pulse_auth");
    if (!auth) {
      router.replace("/login");
    } else {
      setAuthReady(true);
    }
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>Hirenum CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230A0A0A'/%3E%3Ctext x='32' y='42' text-anchor='middle' font-family='Plus Jakarta Sans,Arial' font-size='32' font-weight='800' fill='%231AC9C4'%3Eh%3C/text%3E%3Ccircle cx='46' cy='22' r='4' fill='%23E8158E'/%3E%3C/svg%3E" />
      </Head>

      {!authReady ? (
        <BootScreen />
      ) : router.pathname === "/login" ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}

function BootScreen() {
  return (
    <div className="fixed inset-0 bg-bg-dark flex items-center justify-center z-[100]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl font-extrabold tracking-tight">
          <span className="text-teal">hirenum</span>
          <span className="text-pink animate-pulse">.</span>
        </div>
        <div className="w-32 h-0.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-teal animate-[loading_1s_ease-in-out_infinite]" style={{ width: "40%" }} />
        </div>
      </div>
    </div>
  );
}
