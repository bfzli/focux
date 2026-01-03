import { useState, useEffect } from "react";
import { FocuxIcon } from "@/ui/icons";

export default function Header() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    if (chrome?.runtime) {
      const manifest = chrome.runtime.getManifest();
      setVersion(manifest.version || "");
    }
  }, []);

  return (
    <div className="header">
      <div className="brand">
        <FocuxIcon />
        {version && <span className="version">v{version}</span>}
      </div>

      <div className="footer">
        <span className="footer-text">Build by</span>
        <a href="https://bfzli.com" target="_blank">
          Benjamin
        </a>
      </div>
    </div>
  );
}
