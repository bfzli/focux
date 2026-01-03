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
      </div>

      <div className="footer">
        <span className="footer-text">
          v{version} - Build by&nbsp;
          <a href="https://bfzli.com" target="_blank">
            Bfzli
          </a>
        </span>
      </div>
    </div>
  );
}
