/**
 * Verifies a Gumroad License Key against the official Gumroad API.
 * 
 * @param {string} licenseKey - The license key entered by the user or received via URL.
 * @param {string} [productId] - Optional product_id to verify specific product match (required for products created after Jan 9, 2023).
 * @returns {Promise<{ success: boolean, message: string, purchase?: object }>}
 */

// Product IDs for CTRL PRO products (from Gumroad Dashboard > Content tab)
const CTRL_PRO_PRODUCT_IDS = [
  'cz2M8k0lmJU1l8FLSIL1yg==',   // CTRL PRO Monthly  ← ID verificado via API
  '3nkkWxZTDDOanW-4mxvgng==',   // CTRL PRO Lifetime
];

export async function verifyGumroadLicense(licenseKey, productId = null) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { success: false, message: 'Invalid license key provided.' };
  }

  const cleanKey = licenseKey.trim();

  // Handle dev/testing keys gracefully — only in development mode
  if (import.meta.env.DEV && (cleanKey.toLowerCase().startsWith('dev-') || cleanKey === 'napbak-pro-test')) {
    return {
      success: true,
      message: 'Development license key accepted.',
      purchase: { email: 'dev@napbak.studio', product_name: 'CTRL PRO Test' }
    };
  }

  // If a specific product ID was provided, try that first
  const idsToTry = productId ? [productId] : CTRL_PRO_PRODUCT_IDS;

  for (const id of idsToTry) {
    try {
      const params = new URLSearchParams();
      params.append('product_id', id);
      params.append('license_key', cleanKey);
      params.append('increment_uses_count', 'false');

      const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (data.success && data.purchase && !data.purchase.refunded && !data.purchase.chargebacked) {
        // Check subscription status for recurring products
        if (data.purchase.subscription_cancelled_at || data.purchase.subscription_failed_at) {
          continue; // Try next product ID, this subscription is cancelled
        }
        
        return {
          success: true,
          message: 'License key verified successfully!',
          purchase: data.purchase,
        };
      }
    } catch (err) {
      console.error('Error verifying Gumroad license:', err);
      // Continue to try next product ID
    }
  }

  // If none of the product IDs matched
  return {
    success: false,
    message: 'Invalid or expired license key. Please check your key and try again.',
  };
}
