/** Shared date helpers for experiences */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonthYear(d: string) {
  const [y, m] = d.split("-");
  return `${MONTHS[Number(m) - 1] ?? ""} ${y}`.trim();
}

export function formatExperienceRange(
  start: string,
  end?: string,
  current?: boolean,
) {
  return `${formatMonthYear(start)} – ${current ? "Present" : end ? formatMonthYear(end) : ""}`;
}

export function formatDuration(
  start: string,
  end?: string,
  current?: boolean,
) {
  const [sy, sm] = start.split("-").map(Number);
  const endDate = current || !end ? new Date() : new Date();
  let ey: number;
  let em: number;
  if (current || !end) {
    ey = endDate.getFullYear();
    em = endDate.getMonth() + 1;
  } else {
    [ey, em] = end.split("-").map(Number);
  }
  if (!sy || !sm || !ey || !em) return "";

  let months = (ey - sy) * 12 + (em - sm);
  if (months < 0) months = 0;
  // Inclusive-ish: LinkedIn often counts started month
  months += 1;

  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo${rem === 1 ? "" : "s"}`;
  if (rem === 0) return `${years} yr${years === 1 ? "" : "s"}`;
  return `${years} yr${years === 1 ? "" : "s"} ${rem} mo${rem === 1 ? "" : "s"}`;
}
