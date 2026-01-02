import { useState } from "react";
import { AddIcon } from "../icons";

export default function Input(props) {
  const { url, setUrl, setWebsites, websites } = props;

  const [error, setError] = useState(false);
  const [exists, setExists] = useState(false);

  const handleAddWebsite = (event) => {
    event.preventDefault();

    let formattedUrl = url;
    formattedUrl = formattedUrl.replace(/^(https?:\/\/)/, "");
    formattedUrl = formattedUrl.replace(/^www\./, "");
    formattedUrl = formattedUrl.replace(/\/.*$/, "");

    const isExist = websites.find((website) => website.url === formattedUrl);

    if (isExist) {
      setExists(true);
      return;
    }

    const isValid = () => {
      try {
        const regex = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i;
        if (!regex.test(formattedUrl)) return false;

        let formattedNew = formattedUrl.replace(/^(https?:\/\/)/, "");
        return Boolean(new URL(`https://${formattedNew}`));
      } catch (e) {
        return false;
      }
    };

    if (!isValid()) {
      setError(true);
      return;
    }

    setWebsites([
      {
        url: formattedUrl,
        active: true,
        id: Math.random().toString(36).substring(2, 6),
      },
      ...websites,
    ]);

    chrome.tabs.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.includes(formattedUrl)) {
          chrome.tabs.reload(tabs[i].id);
        }
      }
    });

    setUrl("");
  };

  const onInput = (event) => {
    setUrl(event.target.value);
    setError(false);
    setExists(false);
  };

  return (
    <form onSubmit={handleAddWebsite} className="input">
      <div className="website-info">
        <div className="input-content">
          <div className="websiteText">
            <span className="entry">https://</span>
            <input
              type="text"
              value={url}
              onChange={onInput}
              placeholder="example.com"
              className="input-url"
            />
          </div>
          {(error || exists) && (
            <p className="input-error">
              {error
                ? "Entered URL is not valid!"
                : exists
                ? "Website was already added on the list!"
                : ''}
            </p>
          )}
        </div>
      </div>

      <div className="website-opearation">
        <button type="submit" className="input-add-button">
          <AddIcon />
        </button>
      </div>
    </form>
  );
}
