import { removeBackground, loadImage } from '@/lib/background-removal';
import pubhubLogo from '@/assets/pubhub-logo.png';

export const processLogoBackground = async (): Promise<string> => {
  try {
    // Fetch the logo image
    const response = await fetch(pubhubLogo);
    const blob = await response.blob();
    
    // Load the image
    const imageElement = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(imageElement);
    
    // Create a blob URL for the processed image
    return URL.createObjectURL(processedBlob);
  } catch (error) {
    console.error('Error processing logo background:', error);
    // Fallback to original logo
    return pubhubLogo;
  }
};