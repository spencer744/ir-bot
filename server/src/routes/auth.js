const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { generateToken, requireAuth } = require('../middleware/auth');
const { hubspotCreateOrUpdateContact } = require('../services/hubspot');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 200);
}

// POST /api/auth/register — Gate form submission
router.post('/register', async (req, res, next) => {
  try {
    const first_name = sanitize(req.body.first_name);
    const last_name = sanitize(req.body.last_name);
    const email = sanitize(req.body.email).toLowerCase();
    const phone = sanitize(req.body.phone) || null;
    const deal_slug = sanitize(req.body.deal_slug);

    // Validate required fields
    if (!first_name || !last_name || !email || !deal_slug) {
      return res.status(400).json({ message: 'First name, last name, email, and deal are required.' });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    let investor_id = uuidv4();
    let session_id = uuidv4();
    let is_returning = false;
    let prior_investment_count = 0;

    if (supabase) {
      // Check if investor exists — upsert name/phone if returning
      const { data: existing } = await supabase
        .from('investors')
        .select('id, first_name')
        .eq('email', email)
        .single();

      if (existing) {
        investor_id = existing.id;
        is_returning = true;
        // Update name/phone in case they changed
        await supabase
          .from('investors')
          .update({ first_name: first_name || existing.first_name, last_name: last_name || undefined, phone: phone || undefined })
          .eq('id', investor_id);
        // Count prior sessions for context
        const { count } = await supabase
          .from('sessions')
          .select('id', { count: 'exact', head: true })
          .eq('investor_id', investor_id);
        prior_investment_count = count || 0;
      } else {
        const { data: newInvestor, error: invError } = await supabase
          .from('investors')
          .insert({
            id: investor_id,
            email,
            first_name,
            last_name,
            phone,
          })
          .select('id')
          .single();

        if (invError) throw invError;
        investor_id = newInvestor.id;
      }

      // Get deal
      const { data: deal } = await supabase
        .from('deals')
        .select('id')
        .eq('slug', deal_slug)
        .single();

      // Create session
      const { data: session, error: sessError } = await supabase
        .from('sessions')
        .insert({
          id: session_id,
          investor_id,
          deal_id: deal?.id || null,
          started_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (sessError) throw sessError;
      session_id = session.id;
    }

    // Generate JWT
    const token = generateToken({
      investor_id,
      session_id,
      email,
      deal_slug,
      is_returning,
      prior_investment_count,
    });

    let contactId = null;
    try {
      contactId = await hubspotCreateOrUpdateContact({
        email,
        first_name,
        last_name,
        phone,
        deal_slug,
      });
      if (supabase && contactId) {
        await supabase
          .from('investors')
          .update({ hubspot_contact_id: contactId })
          .eq('id', investor_id);
      }
    } catch (err) {
      console.warn('[HubSpot] Contact sync failed:', err.message);
    }

    res.json({ token, investor_id, session_id, hubspot_contact_id: contactId || null, is_returning, prior_investment_count });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify — Verify session token and return session context
router.post('/verify', requireAuth, async (req, res, next) => {
  try {
    const { investor_id, session_id, email, deal_slug } = req.investor;

    // If Supabase is available, pull fresh investor data
    let investor = null;
    let is_returning = false;
    let last_sections_visited = [];

    if (supabase && investor_id) {
      const { data } = await supabase
        .from('investors')
        .select('id, email, first_name, last_name, phone, investment_goal, syndication_experience, target_range, lead_source, hubspot_contact_id')
        .eq('id', investor_id)
        .single();
      investor = data;

      // Detect returning investor: check for prior sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, sections_viewed')
        .eq('investor_id', investor_id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (sessions && sessions.length > 1) {
        // More than 1 session = returning visitor (current session + at least one prior)
        is_returning = true;

        // Collect all sections from prior sessions
        const allSections = new Set();
        for (const s of sessions) {
          if (Array.isArray(s.sections_viewed)) {
            s.sections_viewed.forEach(sec => allSections.add(sec));
          }
        }
        last_sections_visited = Array.from(allSections);
      }
    }

    res.json({
      valid: true,
      investor_id,
      session_id,
      email,
      deal_slug,
      investor,
      is_returning,
      last_sections_visited,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/check-email — Returning investor fast-pass lookup
router.get('/check-email', async (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  if (!email || !EMAIL_RE.test(email)) {
    return res.json({ exists: false });
  }
  if (!supabase) {
    return res.json({ exists: false });
  }
  try {
    const { data } = await supabase
      .from('investors')
      .select('first_name')
      .eq('email', email)
      .single();
    if (data) {
      return res.json({ exists: true, first_name: data.first_name });
    }
    return res.json({ exists: false });
  } catch {
    return res.json({ exists: false });
  }
});

// GET /api/auth/check-investor — Alias with richer response for T1-A fast-pass
// Returns: { exists, name, priorCount }
router.get('/check-investor', async (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  if (!email || !EMAIL_RE.test(email)) {
    return res.json({ exists: false });
  }
  if (!supabase) {
    return res.json({ exists: false });
  }
  try {
    const { data: investor } = await supabase
      .from('investors')
      .select('first_name, last_name, id')
      .eq('email', email)
      .single();
    if (!investor) return res.json({ exists: false });

    // Count prior sessions
    const { count } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('investor_id', investor.id);

    return res.json({
      exists: true,
      name: investor.first_name,
      priorCount: count || 0,
    });
  } catch {
    return res.json({ exists: false });
  }
});

module.exports = router;
