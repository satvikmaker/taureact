import { useOnline } from "@/hooks";

const ENABLED = import.meta.env.VITE_ENABLE_OFFLINE_INDICATOR === "true";

export function OfflineIndicator() {
  const isOnline = useOnline();

  if (!ENABLED || isOnline) return null;

  return (
    <div
      className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-black text-[13px] font-medium"
      role="alert"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 1l14 14M3.5 6.5A6.5 6.5 0 0112.5 6.5M5.5 9A4 4 0 0110.5 9M7.5 11.5a1.5 1.5 0 013 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>You are offline</span>
    </div>
  );
}
