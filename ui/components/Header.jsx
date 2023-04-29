import { BrowserwingIcon, FocuxIcon } from "../icons";

export default function Header() {
  return (
    <div className="header">
      <div className="brand">
        <FocuxIcon />
        <span className="version">v1.2</span>
      </div>

      <div className="footer">
        <span className="footer-text">By</span>
        <a href="https://browserwings.com" target="_blank">
          <BrowserwingIcon />
        </a>
      </div>
    </div>
  );
}
