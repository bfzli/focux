import { useState } from "react";

interface TabsProps {
  activeTab: "blocklist" | "recommendations";
  onTabChange: (tab: "blocklist" | "recommendations") => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === "blocklist" ? "tab-active" : "tab-inactive"}`}
        onClick={() => onTabChange("blocklist")}
      >
        Blocked Sites
      </button>
      <button
        className={`tab ${activeTab === "recommendations" ? "tab-active" : "tab-inactive"}`}
        onClick={() => onTabChange("recommendations")}
      >
        Recommendations
      </button>
    </div>
  );
}

