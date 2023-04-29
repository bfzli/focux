import "../ui/styles/focux.css";
import ReactDOM from "react-dom/client";
import { useState, useEffect, StrictMode } from "react";
import { Info, Input, Websites, End, Header } from "../ui/components";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Focux />
  </StrictMode>
);

export default function Focux() {
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const isProd = chrome?.storage;

    if (isProd !== undefined) {
      chrome.storage.local.get(["focux-websites-2m31"], (result) => {
        if (result["focux-websites-2m31"]) {
          setWebsites(result["focux-websites-2m31"]);

          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            let activeTab = tabs[0];
            let formattedUrl = activeTab.url;

            const included = result["focux-websites-2m31"].find((www) => formattedUrl.includes(formattedUrl));
    
            if(!included) {
              formattedUrl = formattedUrl.replace(/^(https?:\/\/)/, "");
              formattedUrl = formattedUrl.replace(/^www\./, "");
              formattedUrl = formattedUrl.replace(/\/.*$/, "");
      
              setUrl(formattedUrl);
            }
          });
        }
      });
    } 
    
    else {
      const websites = localStorage.getItem("focux-websites-2m31");
      if (websites) setWebsites(JSON.parse(websites));
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
      <Info />

      <Input
        url={url}
        setUrl={setUrl}
        setWebsites={setWebsites}
        websites={websites}
      />

      <Websites websites={websites} setWebsites={setWebsites} />
      {/* {websites.length !== 0 && <End />} */}
    </>
  );
}
