export function exportToCsv(data: any[], filename: string) {
  // Convert data to CSV string
  const csvContent = [
    // Headers
    Object.keys(data[0] || {}).join(','),
    // Data rows
    ...data.map(row => 
      Object.values(row)
        .map(value => {
          // Escape quotes and wrap in quotes if contains comma or quote
          const escaped = String(value).replace(/"/g, '""');
          return /[,\n"]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
