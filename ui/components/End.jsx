import { CupIcon } from "../icons";

export default function End() {
  return (
    <div className="footer-donation">
      <a href="https://www.buymeacoffee.com/browserwings" target="_blank">
        <div className="donate">
          <span>Buy Us A Coffe</span>
          <CupIcon />
        </div>
      </a>
    </div>
  );
}
