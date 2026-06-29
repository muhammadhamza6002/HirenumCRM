import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === "/login") return;
    const auth = sessionStorage.getItem("pulse_auth");
    if (!auth) router.replace("/login");
  }, [router.pathname]);

  if (router.pathname === "/login") {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
