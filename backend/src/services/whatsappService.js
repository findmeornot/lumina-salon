const axios = require('axios');
const env = require('../config/env');

const sendWhatsApp = async ({ phoneNumber, message }) => {
  if (!env.whatsappProviderUrl || !env.whatsappProviderToken) {
    return { ok: false, skipped: true, reason: 'Provider credentials not configured' };
  }

  try {
    const { data } = await axios.post(
      env.whatsappProviderUrl,
      {
        to: phoneNumber,
        sender: env.whatsappSender,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${env.whatsappProviderToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return { ok: true, providerResponse: JSON.stringify(data) };
  } catch (err) {
    return {
      ok: false,
      providerResponse: JSON.stringify(err.response?.data || err.message)
    };
  }
};

module.exports = { sendWhatsApp };
