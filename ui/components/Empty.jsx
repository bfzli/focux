import { EmptyIcon } from "../icons";

export default function Empty() {
  return (
    <div className="empty">
      <EmptyIcon />
      <p className="empty-text">
        There are no blocked websites, add one, and get focused ✨
      </p>
    </div>
  );
}
