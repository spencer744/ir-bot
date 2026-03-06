const express = require('express');
const { supabase } = require('../config/supabase');
const {
  DEMO_TEAM_MEMBERS,
  DEMO_TRACK_RECORD,
  DEMO_CASE_STUDIES,
  DEMO_TESTIMONIALS,
  DEMO_COMPANY_DATA,
} = require('../services/demoData');

const router = express.Router();

// GET /api/team — All active team members
router.get('/team', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return res.json({ team_members: data || [] });
    }
    return res.json({ team_members: DEMO_TEAM_MEMBERS });
  } catch (err) { next(err); }
});

// GET /api/track-record — All track record entries
router.get('/track-record', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('track_record')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const realized = (data || []).filter(d => d.status === 'realized');
      const active = (data || []).filter(d => d.status === 'active');
      return res.json({ full_cycle: realized, active_projects: active });
    }
    return res.json({
      full_cycle: DEMO_TRACK_RECORD.full_cycle,
      active_projects: DEMO_TRACK_RECORD.active_projects,
    });
  } catch (err) { next(err); }
});

// GET /api/track-record/summary — Computed summary
router.get('/track-record/summary', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('track_record')
        .select('*')
        .eq('status', 'realized');
      if (error) throw error;
      const realized = data || [];
      const count = realized.length;
      if (count === 0) return res.json({ avg_net_irr: 0, avg_equity_multiple: 0, avg_coc: 0, avg_hold_years: 0, total_realized: 0 });
      const avgIrr = realized.reduce((s, d) => s + (d.net_irr || 0), 0) / count;
      const avgEm = realized.reduce((s, d) => s + (d.net_equity_multiple || 0), 0) / count;
      return res.json({ avg_net_irr: +avgIrr.toFixed(1), avg_equity_multiple: +avgEm.toFixed(2), avg_coc: 8, avg_hold_years: 3.5, total_realized: count });
    }
    return res.json(DEMO_TRACK_RECORD.summary);
  } catch (err) { next(err); }
});

// GET /api/case-studies — Active case studies
router.get('/case-studies', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return res.json({ case_studies: data || [] });
    }
    return res.json({ case_studies: DEMO_CASE_STUDIES });
  } catch (err) { next(err); }
});

// GET /api/testimonials — Active testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return res.json({ testimonials: data || [] });
    }
    return res.json({ testimonials: DEMO_TESTIMONIALS });
  } catch (err) { next(err); }
});

// GET /api/company — Company overview data
router.get('/company', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('deals')
        .select('company_data')
        .limit(1)
        .single();
      if (!error && data?.company_data) {
        return res.json({ company_data: data.company_data });
      }
    }
    return res.json({ company_data: DEMO_COMPANY_DATA });
  } catch (err) { next(err); }
});

module.exports = router;
