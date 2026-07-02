export function buildGoogleMapsUrl(direccion: string, ciudad: string, pais: string = 'Colombia'): string {
  const query = `${direccion}, ${ciudad}, ${pais}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildWhatsappUrl(whatsapp: string): string {
  const digits = whatsapp.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}
