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

    if (supabase) {
      // Check if investor exists — upsert name/phone if returning
      const { data: existing } = await supabase
        .from('investors')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        investor_id = existing.id;
        // Update name/phone in case they changed
        await supabase
          .from('investors')
          .update({ first_name, last_name, phone })
          .eq('id', investor_id);
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

    res.json({ token, investor_id, session_id, hubspot_contact_id: contactId || null });
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
    if (supabase && investor_id) {
      const { data } = await supabase
        .from('investors')
        .select('id, email, first_name, last_name, phone, investment_goal, syndication_experience, target_range, lead_source, hubspot_contact_id')
        .eq('id', investor_id)
        .single();
      investor = data;
    }

    res.json({
      valid: true,
      investor_id,
      session_id,
      email,
      deal_slug,
      investor,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
