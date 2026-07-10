export const TITLE_MAX_LENGTH = 48;
export const KEYWORD_MAX_LENGTH = 80;
export const BODY_MAX_LENGTH = 180;
export const CARD_FACE_VALUE_MAX = 99;
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 16_000_000;
export const MAX_PROJECT_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_DATA_URL_LENGTH = 7 * 1024 * 1024;
export const MAX_LOCAL_LIBRARY_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_LOCAL_LIBRARY_CARDS = 200;

export const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(type);
}

export async function hasAllowedImageSignature(file: Pick<File, "slice">): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return isPngHeader(header) || isJpegHeader(header) || isWebpHeader(header);
}

export async function isAllowedImageFile(file: Pick<File, "name" | "type" | "size" | "slice">): Promise<boolean> {
  try {
    return (
      file.size <= MAX_IMAGE_FILE_BYTES &&
      hasAllowedImageTypeOrExtension(file) &&
      await hasAllowedImageSignature(file)
    );
  } catch {
    return false;
  }
}

export function isAllowedImageDimensions(
  image: Pick<HTMLImageElement, "naturalWidth" | "naturalHeight" | "width" | "height">,
): boolean {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  return width > 0 && height > 0 && width * height <= MAX_IMAGE_PIXELS;
}

export function isAllowedImageDataUrl(value: string): boolean {
  return (
    value.length <= MAX_DATA_URL_LENGTH &&
    (value.startsWith("data:image/png;") ||
      value.startsWith("data:image/jpeg;") ||
      value.startsWith("data:image/webp;"))
  );
}

export function loadAllowedImageSource(source: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      image.src = "";
      reject(new Error("Image loading was cancelled."));
    };
    image.onload = () => {
      cleanup();
      if (isAllowedImageDimensions(image)) {
        resolve(image);
      } else {
        reject(new Error("Image dimensions are too large."));
      }
    };
    image.onerror = () => {
      cleanup();
      reject(new Error("Could not decode image."));
    };
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    image.src = source;
  });
}

export async function isAllowedEmbeddedImageDataUrl(value: string): Promise<boolean> {
  if (!isAllowedImageDataUrl(value)) {
    return false;
  }

  try {
    const response = await fetch(value);
    const blob = await response.blob();
    const extension = blob.type === "image/jpeg" ? ".jpg" : blob.type === "image/webp" ? ".webp" : ".png";
    const file = new File([blob], `embedded-artwork${extension}`, { type: blob.type });
    if (!(await isAllowedImageFile(file))) {
      return false;
    }
    await loadAllowedImageSource(value);
    return true;
  } catch {
    return false;
  }
}

function isPngHeader(header: Uint8Array): boolean {
  return (
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  );
}

function hasAllowedImageTypeOrExtension(file: Pick<File, "name" | "type">): boolean {
  if (isAllowedImageType(file.type)) {
    return true;
  }
  if (file.type) {
    return false;
  }
  return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
}

function getFileExtension(path: string): string {
  const baseName = path.replace(/\\/g, "/").split("/").at(-1) ?? path;
  const dotIndex = baseName.lastIndexOf(".");
  return dotIndex >= 0 ? baseName.slice(dotIndex).toLowerCase() : "";
}

function isJpegHeader(header: Uint8Array): boolean {
  return header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
}

function isWebpHeader(header: Uint8Array): boolean {
  return (
    header.length >= 12 &&
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  );
}
