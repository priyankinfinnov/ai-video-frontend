import toast from 'react-hot-toast';

export const resolveAssetUrl = (path?: string | null): string | null => {
  if (!path || !path.trim()) return null;
  const trimmed = path.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const normalized = trimmed.replace(/\\/g, '/');

  // Absolute windows path like "E:/..." or "C:/..."
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return null;
  }

  if (normalized.startsWith('/')) {
    return `http://localhost:6001${normalized}`;
  }

  return `http://localhost:6001/${normalized}`;
};

export const getFileName = (path?: string | null): string => {
  if (!path) return '';
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || path;
};

export const getFileExtension = (path?: string | null): string => {
  if (!path) return '';
  const match = path.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
  return match ? match[1].toLowerCase() : '';
};

export const copyToClipboard = (text: string, label = 'Path') => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};
