import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

interface NominatimResponse {
    lat: string;
    lon: string;
    display_name: string;
    place_id: number;
}

@Injectable()
export class GeocodeProvider {
    private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';

    public async geocode(address: string, city: string): Promise<{
        latitude: number,
        longitude: number,
        displayName: string,
    } | null> {

        const params = new URLSearchParams({
            q: `${address}, ${city}`,
            countrycodes: 'hr',  // ISO 3166-1 alpha-2 kod za Hrvatsku
            format: 'json',
            limit: '1',
            addressdetails: '1',
        });

        const response = await fetch(`${this.baseUrl}?${params}`, {
            headers: {
                'User-Agent': 'RestoraniZEGE/1.0 (karlo.kus@gmail.com)',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new HttpException(
                'Geocoding servis nije dostupan',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const data: NominatimResponse[] = await response.json();

        if (data.length === 0) {
            return null;
        }

        return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            displayName: data[0].display_name,
        };
    }
}