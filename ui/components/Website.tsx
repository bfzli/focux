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
        <label className="inline-flex items-center cursor-pointer mr-2 flex-shrink-0">
          <input
            type="checkbox"
            checked={website?.active || false}
            onChange={onActivate}
            className="sr-only peer"
          />
          <div className="relative w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[17px] after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#212331]"></div>
        </label>

        <DeleteIcon onClick={onDelete} />
      </div>
    </div>
  );
}
