const express = require('express');
const router = express.Router();

// GET /api/config — Public CTA URLs (no auth required)
router.get('/config', (req, res) => {
  res.json({
    meetingsUrl: process.env.HUBSPOT_MEETING_URL || 'https://meetings.hubspot.com/gray-capital',
    investmentPortalUrl: process.env.INVESTMENT_PORTAL_URL || 'https://investors.appfolioim.com/graycapitalllc',
    institutionalFormUrl: process.env.HUBSPOT_INSTITUTIONAL_FORM_URL || '',
    hubspotPortalId: process.env.HUBSPOT_PORTAL_ID || '',
  });
});

module.exports = router;
