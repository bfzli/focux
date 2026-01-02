import { Empty, Website, Input } from "./";

export default function Websites({ websites, setWebsites, url, setUrl }) {
  return (
    <div className="websites">
      <Input
        url={url}
        setUrl={setUrl}
        setWebsites={setWebsites}
        websites={websites}
      />

      {websites.length !== 0 && websites.map((website) => (
        <Website 
          website={website} 
          setWebsites={setWebsites}
          websites={websites} 
        />
      ))}

      {websites.length === 0 && <Empty />}
    </div>
  );
}
