import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

console.log('🔧 Cloudinary Configuration Check:');
console.log('  Cloud Name:', cloudinaryConfig.cloud_name ? '✅ Set' : '❌ Missing', `(${cloudinaryConfig.cloud_name})`);
console.log('  API Key:', cloudinaryConfig.api_key ? '✅ Set' : '❌ Missing', `(${cloudinaryConfig.api_key})`);
console.log('  API Secret:', cloudinaryConfig.api_secret ? '✅ Set (length: ' + (cloudinaryConfig.api_secret?.length || 0) + ')' : '❌ Missing');

if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn('⚠️  WARNING: Cloudinary credentials are not fully configured!');
  console.warn('   Audio upload will not work. Please add to .env file:');
  console.warn('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.warn('   CLOUDINARY_API_KEY=your_api_key');
  console.warn('   CLOUDINARY_API_SECRET=your_api_secret');
}

cloudinary.config(cloudinaryConfig);

/**
 * Upload audio buffer to Cloudinary
 * @param {Buffer} audioBuffer - The audio file buffer
 * @param {string} filename - The filename to use (without extension)
 * @returns {Promise<string>} - The secure URL of the uploaded audio
 */
export const uploadAudio = async (audioBuffer, filename) => {
  try {
    console.log(`🎵 Attempting to upload audio to Cloudinary: ${filename}`);
    console.log(`   Buffer size: ${audioBuffer.length} bytes`);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary treats audio as video
          folder: 'interview-audio',
          public_id: filename,
          format: 'webm', // Default format for browser recordings
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Audio uploaded successfully:', result.secure_url);
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(audioBuffer);
    });
  } catch (error) {
    console.error('Error in uploadAudio:', error);
    throw error;
  }
};

export default cloudinary;
