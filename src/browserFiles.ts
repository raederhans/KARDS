export type BrowserFileReadMode = "text" | "data-url";

export function readBrowserFile(file: File, mode: BrowserFileReadMode): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error(`Could not read ${file.name}.`));
      }
    });
    reader.addEventListener("error", () => reject(new Error(`Could not read ${file.name}.`)));
    reader.addEventListener("abort", () => reject(new Error(`Reading ${file.name} was cancelled.`)));

    if (mode === "text") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
}

export async function consumeSelectedFile(
  input: Pick<HTMLInputElement, "files" | "value">,
  consume: (file: File) => Promise<unknown>,
): Promise<void> {
  try {
    const file = input.files?.[0];
    if (file) {
      await consume(file);
    }
  } finally {
    input.value = "";
  }
}
