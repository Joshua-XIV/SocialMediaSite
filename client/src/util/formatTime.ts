const units = [
  {label: 'y', seconds: 31536000},
  {label: 'mo', seconds: 2592000},
  {label: 'wk', seconds: 604800},
  {label: 'd', seconds: 86400},
  {label: 'h', seconds: 3600},
  {label: 'm', seconds: 60},
  {label: 's', seconds: 1}
]

export function formatTimeShort(date: string | Date) : string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  for (const unit of units) {
    const value = Math.floor(seconds/unit.seconds)
    if (value > 0) {
      return `${value}${unit.label}`;
    }
  }

  return 'now';
}