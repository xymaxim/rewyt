const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatOffset(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	const offMin = -d.getTimezoneOffset();
	const sign = offMin >= 0 ? "+" : "-";
	const abs = Math.abs(offMin);
	const om = abs % 60;
	return om === 0
		? `${sign}${pad(Math.floor(abs / 60))}`
		: `${sign}${pad(Math.floor(abs / 60))}:${pad(om)}`;
}

export function formatLocalTime(ts: number): string {
	const d = new Date(ts);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${formatOffset(d)}`;
}

export function formatLocalIso(ts: number): string {
	const d = new Date(ts);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${formatOffset(d)}`;
}