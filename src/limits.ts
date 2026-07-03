export const TITLE_MAX_LENGTH = 48;
export const KEYWORD_MAX_LENGTH = 80;
export const BODY_MAX_LENGTH = 180;
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_PROJECT_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_DATA_URL_LENGTH = 7 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(type);
}

export function isAllowedImageDataUrl(value: string): boolean {
  return (
    value.length <= MAX_DATA_URL_LENGTH &&
    (value.startsWith("data:image/png;") ||
      value.startsWith("data:image/jpeg;") ||
      value.startsWith("data:image/webp;"))
  );
}
