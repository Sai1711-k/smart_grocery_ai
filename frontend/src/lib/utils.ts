export function getValidImageUrl(url: string | null | undefined, fallbackName: string): string {
  if (url && url.startsWith('http')) {
    return url;
  }
  
  // Clean up the name to generate a good keyword (take first 2 words max)
  const keywords = fallbackName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(',');

  // Return a reliable fallback image using LoremFlickr (keywords matched against Flickr images)
  return `https://loremflickr.com/400/400/${keywords},food/all`;
}
