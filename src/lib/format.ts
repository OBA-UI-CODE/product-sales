export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatNaira(amount: number) {
  return "₦ " + amount.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}
