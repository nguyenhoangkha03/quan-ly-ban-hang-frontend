/**
 * Get image path for display
 * With Next.js rewrites, /uploads requests are proxied through Next.js server
 * So we can use relative paths like /uploads/products/image.jpg
 * 
 * @param path - Image path from database (e.g., /uploads/products/image.jpg)
 * @returns Image URL (e.g., /uploads/products/image.jpg for Next.js rewrite)
 */
export const getImagePath = (path: string): string => {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Return relative path - Next.js will rewrite to backend
  // /uploads/products/image.jpg -> rewritten to http://localhost:5000/uploads/products/image.jpg
  return path.startsWith('/') ? path : `/${path}`;
};