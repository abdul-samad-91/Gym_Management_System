import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'hh:mm a');
};

export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDuration = (startDate, endDate = null) => {
  if (!startDate) return 'N/A';
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  let diffSeconds = Math.floor((end - start) / 1000);
  if (diffSeconds < 0) diffSeconds = 0;

  const hours = Math.floor(diffSeconds / 3600);
  diffSeconds %= 3600;
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!hours && !minutes) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
};

// export const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'PKR',
//     minimumFractionDigits: 0,
//   }).format(amount);
// };


export const formatCurrency = (amount = 0) => {
  return `Rs ${new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
  }).format(amount)}`;
};


export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getStatusColor = (status) => {
  const colors = {
    Active: 'badge-success',
    Expired: 'badge-danger',
    'On Hold': 'badge-warning',
    Inactive: 'badge-gray',
    Paid: 'badge-success',
    Pending: 'badge-warning',
    Failed: 'badge-danger',
  };
  
  return colors[status] || 'badge-gray';
};

export const daysUntil = (date) => {
  if (!date) return null;
  const today = new Date().setHours(0, 0, 0, 0);
  const target = new Date(date).setHours(0, 0, 0, 0);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isExpiringSoon = (date, days = 7) => {
  const daysLeft = daysUntil(date);
  return daysLeft !== null && daysLeft <= days && daysLeft >= 0;
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

