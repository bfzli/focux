import { useState } from "react";
import { DeleteIcon } from "@/ui/icons";
import type { WebsiteProps } from "@/types";

export default function Website({ website, websites, setWebsites, isLast }: WebsiteProps) {
  const [favicon, setFavicon] = useState<string | null>(null);

  const onActivate = () => {
    const updatedWebsites = websites.map((www) => {
      if (www.id === website.id) {
        return {
          ...www,
          active: !www.active,
        };
      }
      return www;
    });

    setWebsites(updatedWebsites);

    chrome.storage.local.set({ "focux-websites-2m31": updatedWebsites }, () => {
      chrome.runtime.sendMessage({ action: "broadcastUpdate" }).catch(() => {});
    });
  };

  const onDelete = () => {
    const newWebsites = websites.filter((www) => www.id !== website.id);

    setWebsites(newWebsites);

    chrome.storage.local.set({ "focux-websites-2m31": newWebsites }, () => {
      chrome.runtime.sendMessage({ action: "broadcastUpdate" }).catch(() => {});
    });
  };

  const onError = () => {
    const example = `https://www.google.com/s2/favicons?domain=https://example.com`;
    setFavicon(example);
  }

  return (
    <div className="website" style={isLast ? { marginBottom: 0 } : undefined}>
      <div className="website-info">
        <img src={favicon !== null ? favicon : `https://www.google.com/s2/favicons?domain=${website?.url}`} onError={onError} alt="website favicon" className="favicon" />
        <div className="websiteText">
          <span className="entry">https://</span>
          <span className="url">{website?.url?.length < 18 ? website?.url : website?.url?.substring(0, 18) + "..."}</span>
        </div>
      </div>

      <div className="website-opearation">
        {website?.active && (
          <span className="label-active label" onClick={onActivate}>
            Focusing
          </span>
        )}

        {!website?.active && (
          <span className="label-inactive label" onClick={onActivate}>
            Not Focusing
          </span>
        )}

        <DeleteIcon onClick={onDelete} />
      </div>
    </div>
  );
}
