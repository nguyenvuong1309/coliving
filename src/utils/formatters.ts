/**
 * Format a number as Vietnamese Dong currency.
 * e.g. 5000000 -> "5.000.000đ"
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN').replace(/,/g, '.') + 'đ';
}

/**
 * Format an ISO date string to DD/MM/YYYY.
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format an ISO date string to DD/MM/YYYY HH:mm.
 */
export function formatDateTime(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format an ISO date string as a Vietnamese relative time string.
 * e.g. "2 giờ trước", "hôm qua", "3 ngày trước"
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'vừa xong';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  if (diffDays === 1) {
    return 'hôm qua';
  }
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần trước`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng trước`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} năm trước`;
}

/**
 * Return a Vietnamese label for a given status string.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    // Borrow request statuses
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    in_use: 'Đang mượn',
    return_requested: 'Yêu cầu trả',
    returned: 'Đã trả',

    // Issue statuses
    open: 'Mở',
    in_progress: 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
    reopened: 'Mở lại',

    // Payment statuses
    unpaid: 'Chưa thanh toán',
    tenant_reported: 'Đã báo thanh toán',
    confirmed: 'Đã xác nhận',
    overdue: 'Quá hạn',

    // Asset condition
    good: 'Tốt',
    fair: 'Bình thường',
    poor: 'Kém',

    // Urgency
    normal: 'Bình thường',
    urgent: 'Khẩn cấp',

    // Payment methods
    bank_transfer: 'Chuyển khoản',
    cash: 'Tiền mặt',
  };
  return labels[status] ?? status;
}
