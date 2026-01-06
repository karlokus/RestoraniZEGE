import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Učitaj .env file PRIJE čitanja environment varijabli
const ENV = process.env.NODE_ENV;
const envPath = ENV ? `.env.${ENV}` : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envPath) });

// Cloudinary konfiguracija - direktno čitanje iz process.env
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Provjeri jesu li sve varijable dostupne
if (!cloudName || !apiKey || !apiSecret) {
    console.error('Missing Cloudinary credentials!');
    console.error('CLOUDINARY_CLOUD_NAME:', cloudName);
    console.error('CLOUDINARY_API_KEY:', apiKey ? 'SET' : 'MISSING');
    console.error('CLOUDINARY_API_SECRET:', apiSecret ? 'SET' : 'MISSING');
    throw new Error('Cloudinary credentials are not properly configured');
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

// Multer storage za Cloudinary
export const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'restaurants',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
        ],
    } as any,
});

export const cloudinaryConfig = {
    storage: cloudinaryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};

export { cloudinary };