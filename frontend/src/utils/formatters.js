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