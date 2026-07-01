export function buildGoogleMapsUrl(direccion: string, ciudad: string): string {
  const query = `${direccion}, ${ciudad}, Colombia`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildWhatsappUrl(whatsapp: string): string {
  const digits = whatsapp.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}
