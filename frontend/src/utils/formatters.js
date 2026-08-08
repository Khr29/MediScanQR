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
    case 'PENDING':
      return 'warning';
    case 'DISPENSED':
    case 'COMPLETED':
    case 'APPROVED':
    case 'SUCCESS':
      return 'success';
    case 'EXPIRED':
    case 'REVOKED':
    case 'REJECTED':
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
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'DISPENSED':
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'EXPIRED':
    case 'REVOKED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'CANCELLED':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};