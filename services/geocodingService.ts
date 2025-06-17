import type { ApiResponse } from '@/types/api';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  country?: string;
}

class GeocodingService {
  private readonly API_KEY = process.env.NEXT_PUBLIC_GEOCODING_API_KEY || '';
  
  /**
   * Convertir une adresse en coordonnées GPS
   * Utilise l'API Nominatim d'OpenStreetMap (gratuite)
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'EcoDeli/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          city: result.address?.city || result.address?.town,
          country: result.address?.country
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  }
  
  /**
   * Calculer la distance entre deux points GPS
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const geocodingService = new GeocodingService();