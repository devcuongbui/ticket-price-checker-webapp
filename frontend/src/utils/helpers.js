/**
 * Format price to Vietnamese currency: 75000 -> "75.000 đ"
 */
export function formatPrice(price) {
  if (price == null) return null;
  return price.toLocaleString("vi-VN") + " đ";
}

/**
 * Remove Vietnamese accents for search matching
 */
export function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Find the best (lowest) price among 3 platforms
 * Returns { bestPrice, bestPlatforms: ['momo', 'zalopay', ...] }
 */
export function findBestPrice(prices) {
  const entries = Object.entries(prices).filter(([, v]) => v != null);
  if (entries.length === 0) return { bestPrice: null, bestPlatforms: [] };

  const min = Math.min(...entries.map(([, v]) => v));
  const bestPlatforms = entries.filter(([, v]) => v === min).map(([k]) => k);
  return { bestPrice: min, bestPlatforms };
}

/**
 * Format date to Vietnamese display: "2026-02-25" -> "T3, 25/02"
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const day = days[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return { dayOfWeek: day, display: `${dd}/${mm}`, full: `${day}, ${dd}/${mm}` };
}

/**
 * Platform display info
 */
export const PLATFORMS = {
  momo: { name: "MoMo", color: "#a50064", bgColor: "#a5006415" },
  zalopay: { name: "ZaloPay", color: "#008fe5", bgColor: "#008fe515" },
  vnpay: { name: "VNPay", color: "#0066b3", bgColor: "#0066b315" },
};
