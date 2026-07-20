export function getSelectionCardClassName(selected: boolean): string {
  return selected
    ? "relative border-[#f2da9c] bg-[rgba(215,180,106,0.18)] ring-2 ring-[#f2da9c] ring-offset-2 ring-offset-[#070812] shadow-[0_0_0_1px_rgba(242,218,156,0.45),0_0_28px_rgba(215,180,106,0.32)]"
    : "";
}
