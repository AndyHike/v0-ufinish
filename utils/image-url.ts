/**
 * Formats an image URL to ensure it's properly accessible
 * This function handles both absolute URLs and relative paths
 */
export function formatImageUrl(url: string): string {
  if (!url) return url

  // If it's already an absolute URL, return it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // If it's a relative path starting with '/', it's from the public folder
  if (url.startsWith("/")) {
    return url
  }

  // Otherwise, assume it's a storage URL that needs to be constructed
  // This is just an example - adjust according to your actual storage setup
  const baseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
    : "/"

  return `${baseStorageUrl}${url}`
}
