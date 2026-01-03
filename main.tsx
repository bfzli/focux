import "@/ui/styles/focux.css";
import ReactDOM from "react-dom/client";
import { useState, useEffect, StrictMode } from "react";
import { Websites, End, Header } from "@/ui/components";
import type { Website } from "@/types";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Focux />
  </StrictMode>
);

export default function Focux() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [url, setUrl] = useState<string>("");

  const isValidDomain = (formattedUrl: string): boolean => {
    try {
      if (!formattedUrl || formattedUrl.trim() === "") return false;

      const specialProtocols = /^(chrome|about|edge|file|moz-extension|chrome-extension|opera|arc):/i;
      if (specialProtocols.test(formattedUrl)) return false;

      if (formattedUrl.includes(":")) return false;

      const regex = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i;
      if (!regex.test(formattedUrl)) return false;

      let formattedNew = formattedUrl.replace(/^(https?:\/\/)/, "");
      if (!formattedNew.includes(".")) return false;

      return Boolean(new URL(`https://${formattedNew}`));
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const isProd = chrome?.storage;

    if (isProd !== undefined) {
      chrome.storage.local.get(["focux-websites-2m31"], (result) => {
        const storedWebsites = (result["focux-websites-2m31"] || []) as Website[];
        setWebsites(storedWebsites);

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (!tabs || !tabs[0] || !tabs[0].url) return;

          let tabUrl = tabs[0].url;

          if (!tabUrl || typeof tabUrl !== "string") return;

          if (!tabUrl.startsWith("http://") && !tabUrl.startsWith("https://")) {
            return;
          }

          const invalidProtocols = /^(chrome|about|edge|file|moz-extension|chrome-extension|opera|arc):/i;
          if (invalidProtocols.test(tabUrl)) {
            return;
          }

          let formattedUrl = tabUrl;
          formattedUrl = formattedUrl.replace(/^(https?:\/\/)/, "");
          formattedUrl = formattedUrl.replace(/^www\./, "");
          formattedUrl = formattedUrl.replace(/\/.*$/, "");

          if (!formattedUrl || formattedUrl.trim() === "") return;

          if (formattedUrl.includes(":")) {
            return;
          }

          if (!formattedUrl.includes(".")) {
            return;
          }

          if (isValidDomain(formattedUrl)) {
            setUrl(formattedUrl);
          }
        });
      });
    } 
    
    else {
      const websites = localStorage.getItem("focux-websites-2m31");
      if (websites) setWebsites(JSON.parse(websites) as Website[]);
    }
  }, []);

  useEffect(() => {
    const isProd = chrome?.storage;

    if (isProd !== undefined) chrome.storage.local.set({ "focux-websites-2m31": websites })
    else localStorage.setItem("focux-websites-2m31", JSON.stringify(websites));
  }, [websites]);

  return (
    <>
      <Header />

      <Websites 
        websites={websites} 
        setWebsites={setWebsites}
        url={url}
        setUrl={setUrl}
      />
    </>
  );
}
