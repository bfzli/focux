import { Empty, Website, Input } from "@/ui/components";
import type { WebsitesProps } from "@/types";

export default function Websites({ websites, setWebsites, url, setUrl }: WebsitesProps) {
  return (
    <div className="websites">
      <Input
        url={url}
        setUrl={setUrl}
        setWebsites={setWebsites}
        websites={websites}
      />

      {websites.length !== 0 && websites.map((website, index) => (
        <Website 
          key={website.id}
          website={website} 
          setWebsites={setWebsites}
          websites={websites}
          isLast={index === websites.length - 1}
        />
      ))}

      {websites.length === 0 && <Empty />}
    </div>
  );
}
