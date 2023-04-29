export default function DeleteIcon({onClick}) {
  return (
    <svg
      onClick={onClick}
      width="20"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className="delete-icon"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#fff"
    >
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
