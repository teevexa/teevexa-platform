// ── Currency ──────────────────────────────────────────────────────────────────
const FORMATTERS: Record<string, Intl.NumberFormat> = {
  KES: new Intl.NumberFormat("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
};

const SYMBOLS: Record<string, string> = { KES: "KSh", USD: "$" };

export function formatCurrency(amount: number, currency: string): string {
  const code = (currency || "KES").toUpperCase();
  const fmt = FORMATTERS[code];
  if (!fmt) return `${code} ${amount.toLocaleString()}`;
  const symbol = SYMBOLS[code];
  return symbol
    ? code === "USD"
      ? fmt.format(amount)
      : `${symbol} ${fmt.format(amount)}`
    : fmt.format(amount);
}

// ── File size ─────────────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Relative time ─────────────────────────────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── File type icon hint ───────────────────────────────────────────────────────
export type FileKind = "pdf" | "image" | "spreadsheet" | "doc" | "video" | "archive" | "generic";

export function fileKind(fileType: string | null, fileName: string): FileKind {
  const mime = (fileType || "").toLowerCase();
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (mime.includes("pdf") || ext === "pdf") return "pdf";
  if (mime.startsWith("image/") || ["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "image";
  if (mime.includes("spreadsheet") || mime.includes("excel") || ["xls","xlsx","csv"].includes(ext)) return "spreadsheet";
  if (mime.includes("word") || mime.includes("document") || ["doc","docx"].includes(ext)) return "doc";
  if (mime.startsWith("video/") || ["mp4","mov","avi","mkv"].includes(ext)) return "video";
  if (["zip","rar","tar","gz","7z"].includes(ext)) return "archive";
  return "generic";
}
