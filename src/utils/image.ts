export const MAX_SINGLE_IMAGE_MB = 2;
export const MAX_TOTAL_IMAGES_MB = 5;

export function validateImageSize(file: File, maxMB: number = MAX_SINGLE_IMAGE_MB): boolean {
  const maxBytes = maxMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export function validateTotalSize(images: string[], newImage: string, maxMB: number = MAX_TOTAL_IMAGES_MB): boolean {
  const totalBase64 = [...images, newImage].join('');
  const estimatedBytes = (totalBase64.length * 3) / 4;
  return estimatedBytes <= maxMB * 1024 * 1024;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(
  base64: string,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64);
      }
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}
