import { Empty, Website } from "./";

export default function Websites({ websites, setWebsites }) {
  return (
    <div className="websites">
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
