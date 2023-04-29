import { useState } from "react";
import { DeleteIcon } from "../icons";

export default function Website({ website, websites, setWebsites }) {
  const [favicon, setFavicon] = useState(null);

  const onActivate = () => {
    setWebsites(
      websites.map((www) => {
        if (www.id === website.id) {
          return {
            ...www,
            active: !www.active,
          };
        }

        return www;
      })
    );

    chrome.tabs.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.includes(website.url)) {
          chrome.tabs.reload(tabs[i].id);
        }
      }
    });
  };

  const onDelete = () => {
    const newWebsites = websites.filter((www) => www.id !== website.id);

    chrome.tabs.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.includes(website.url)) {
          chrome.tabs.reload(tabs[i].id);
        }
      }
    });

    setWebsites(newWebsites);
  };

  const onError = () => {
    const example = `https://www.google.com/s2/favicons?domain=https://example.com`;
    setFavicon(example);
  }

  return (
    <div className="website">
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
