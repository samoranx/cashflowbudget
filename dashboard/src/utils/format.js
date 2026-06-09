export function formatZAR(amount) {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('af-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `R ${formatted}`;
}

export function formatZARCompact(amount) {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `R ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `R ${(abs / 1_000).toFixed(1)}k`;
  return formatZAR(abs);
}

export function shortMonth(payMonth) {
  return payMonth.split('-')[0];
}
