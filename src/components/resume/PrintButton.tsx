"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-sm border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
    >
      Print
    </button>
  );
}
