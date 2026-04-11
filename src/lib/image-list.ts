/** Нормализует список фото из JSON и обложки */
export function getImageList(imageUrlsJson: string | undefined, imageUrl?: string | null): string[] {
  let urls: string[] = [];
  try {
    const parsed = JSON.parse(imageUrlsJson || "[]") as unknown;
    if (Array.isArray(parsed)) {
      urls = parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    }
  } catch {
    urls = [];
  }

  const cover = (imageUrl || "").trim();
  if (cover && !urls.includes(cover)) urls.unshift(cover);
  return urls;
}
