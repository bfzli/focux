import { EmptyIcon } from "@/ui/icons";

export default function Empty() {
  return (
    <div className="empty">
      <EmptyIcon />
      
      <p className="empty-text">
        No websites in the focus list. add one, and get focused.
      </p>
    </div>
  );
}
