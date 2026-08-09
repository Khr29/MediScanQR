/**
 * Format ISO date string into readable local format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format ISO date string into readable local date + time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Map a status/result string to a Badge `variant` prop.
 */
export const getStatusVariant = (status) => {
  switch (status?.toUpperCase()) {
    case 'ISSUED':
    case 'ACTIVE':
    case 'DISPENSED':
    case 'COMPLETED':
    case 'APPROVED':
    case 'VERIFIED':
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
    case 'WAITING':
      return 'warning';
    case 'EXPIRED':
    case 'REVOKED':
    case 'REJECTED':
    case 'INVALID':
    case 'FAILED':
      return 'danger';
    // CANCELLED falls through to the default 'neutral' - a deliberate doctor
    // action, not a failure state, so it shouldn't read as danger/warning.
    default:
      return 'neutral';
  }
};

/**
 * Format prescription status to styled badge color classes
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'ISSUED':
    case 'ACTIVE':
    case 'DISPENSED':
    case 'COMPLETED':
    case 'APPROVED':
    case 'VERIFIED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
    case 'WAITING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'EXPIRED':
    case 'REVOKED':
    case 'REJECTED':
    case 'INVALID':
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CANCELLED':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};