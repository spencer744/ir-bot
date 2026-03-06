const express = require('express');
const { supabase } = require('../config/supabase');

const router = express.Router();

// GET /api/testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    if (supabase) {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      return res.json({ testimonials: data || [] });
    }

    // Demo testimonials
    res.json({
      testimonials: [
        {
          id: '1',
          name: 'Sample LP Investor',
          title: 'Investing since 2021',
          quote: 'Testimonials will be loaded from the database once configured.',
          deals_invested: 3,
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/benchmarks
router.get('/benchmarks', (req, res) => {
  res.json({
    savings: 0.045,
    treasury_10yr: 0.042,
    muni_bond: 0.035,
    sp500_avg: 0.10,
    as_of: '2026-03-01',
  });
});

module.exports = router;
