/**
 * High-Performance Client-Side Image Resizer & Optimizer for Meta AI Vision
 * Compresses raw high-megapixel mobile camera photos into lightweight, high-fidelity
 * JPEG buffers (~200KB - 400KB) before transmission.
 * 
 * Prevents Vercel 413 Payload Too Large errors (Vercel hard limit is 4.5MB).
 * Ensures instantaneous network upload and sub-3-second Meta Model API inference.
 */

export async function compressImageForMetaVision(
  source: File | string,
  maxDimension = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // SSR / Node safe fallback
    if (typeof window === "undefined" || typeof Image === "undefined") {
      resolve(typeof source === "string" ? source : "");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;

      if (!w || !h) {
        resolve(typeof source === "string" ? source : "");
        return;
      }

      // Proportional aspect ratio downscaling
      if (w > maxDimension || h > maxDimension) {
        if (w > h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(typeof source === "string" ? source : "");
          return;
        }

        // Draw with smooth bi-linear interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } catch (err) {
        console.warn("Canvas compression failed, falling back to raw data:", err);
        resolve(typeof source === "string" ? source : "");
      }
    };

    img.onerror = () => {
      resolve(typeof source === "string" ? source : "");
    };

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          img.src = reader.result;
        } else {
          reject(new Error("Failed to read image file"));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
    }
  });
}
