/**
 * Verifies a Gumroad License Key against the official Gumroad API.
 * 
 * @param {string} licenseKey - The license key entered by the user or received via URL.
 * @param {string} [productPermalink] - Optional permalink to verify specific product match.
 * @returns {Promise<{ success: boolean, message: string, purchase?: object }>}
 */
export async function verifyGumroadLicense(licenseKey, productPermalink = null) {
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

  try {
    const params = new URLSearchParams();
    params.append('license_key', cleanKey);
    params.append('increment_uses_count', 'false');

    if (productPermalink) {
      params.append('product_permalink', productPermalink);
    }

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    if (data.success && data.purchase && !data.purchase.refunded && !data.purchase.chargebacked) {
      return {
        success: true,
        message: 'License key verified successfully!',
        purchase: data.purchase,
      };
    } else {
      const errorMsg = data.message || (data.purchase?.refunded ? 'This license key has been refunded.' : 'Invalid or expired license key.');
      return {
        success: false,
        message: errorMsg,
      };
    }
  } catch (err) {
    console.error('Error verifying Gumroad license:', err);
    return {
      success: false,
      message: 'Failed to connect to Gumroad verification server. Check your connection.',
    };
  }
}
