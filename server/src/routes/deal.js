const express = require('express');
const { supabase } = require('../config/supabase');
const { DEMO_DEAL } = require('../services/demoData');
const { hubspotCreateOrUpdateContact } = require('../services/hubspot');
const { onPPMRequested, onInterestIndicated } = require('../services/workflows');
const { createDeal, createNote, updateContactPropertiesById } = require('../services/hubspot');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 500);
}

function parseName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 0) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

// GET /api/deal/:slug — Full deal data
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (supabase) {
      const { data: deal, error } = await supabase
        .from('deals')
        .select('*')
        .eq('slug', slug)
        .in('status', ['live', 'coming_soon'])
        .single();

      if (error || !deal) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      return res.json({ deal });
    }

    // Demo mode: return sample deal
    if (slug === DEMO_DEAL.slug || slug === 'demo') {
      return res.json({ deal: DEMO_DEAL });
    }

    return res.status(404).json({ message: 'Deal not found' });
  } catch (err) {
    next(err);
  }
});

// GET /api/deal/:slug/sensitivity — Sensitivity tables
router.get('/:slug/sensitivity', async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (supabase) {
      const { data: deal } = await supabase
        .from('deals')
        .select('sensitivity_data')
        .eq('slug', slug)
        .single();

      return res.json(deal?.sensitivity_data || {});
    }

    return res.json(DEMO_DEAL.sensitivity_data || {});
  } catch (err) {
    next(err);
  }
});

// GET /api/deal/:slug/media — Photos, videos, documents
router.get('/:slug/media', async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (supabase) {
      const { data: deal } = await supabase
        .from('deals')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!deal) return res.json({ media: [] });

      const { data: media } = await supabase
        .from('deal_media')
        .select('*')
        .eq('deal_id', deal.id)
        .order('sort_order', { ascending: true });

      return res.json({ media: media || [] });
    }

    // Demo media
    const demoMedia = [
      { id: 'm1', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Exterior+Front', caption: 'Front entrance and leasing office', category: 'exterior', sort_order: 1 },
      { id: 'm2', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Exterior+Pool', caption: 'Resort-style swimming pool', category: 'exterior', sort_order: 2 },
      { id: 'm3', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Aerial+View', caption: 'Aerial view of community', category: 'aerial', sort_order: 3 },
      { id: 'm4', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Living+Room', caption: 'Renovated living room', category: 'interior', sort_order: 4 },
      { id: 'm5', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Kitchen', caption: 'Updated kitchen with quartz countertops', category: 'interior', sort_order: 5 },
      { id: 'm6', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Bedroom', caption: 'Spacious primary bedroom', category: 'interior', sort_order: 6 },
      { id: 'm7', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Bathroom', caption: 'Renovated bathroom vanity', category: 'interior', sort_order: 7 },
      { id: 'm8', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Fitness+Center', caption: 'Updated fitness center', category: 'amenity', sort_order: 8 },
      { id: 'm9', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Clubhouse', caption: 'Renovated clubhouse lounge', category: 'amenity', sort_order: 9 },
      { id: 'm10', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Dog+Park', caption: 'Fenced dog park', category: 'amenity', sort_order: 10 },
      { id: 'm11', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Playground', caption: 'Children\'s playground area', category: 'amenity', sort_order: 11 },
      { id: 'm12', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Before+Kitchen', caption: 'Kitchen before renovation', category: 'renovation', sort_order: 12 },
      { id: 'm13', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=After+Kitchen', caption: 'Kitchen after renovation', category: 'renovation', sort_order: 13 },
      { id: 'm14', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Aerial+Property', caption: 'Property aerial with surroundings', category: 'aerial', sort_order: 14 },
      { id: 'm15', deal_id: DEMO_DEAL.id, type: 'photo', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Exterior+Buildings', caption: 'Garden-style building exteriors', category: 'exterior', sort_order: 15 },
      { id: 'mv1', deal_id: DEMO_DEAL.id, type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', caption: 'Drone flyover', category: 'aerial', sort_order: 16 },
      // Documents
      { id: 'd1', deal_id: DEMO_DEAL.id, type: 'document', url: '#', caption: 'Investment Deck', category: 'document', sort_order: 20, document_role: 'deck', description: 'Comprehensive overview of the Fairmont Apartments investment opportunity including property details, market analysis, financial projections, and sponsor track record.', pages: 42, file_size: '8.2 MB', file_type: 'PDF', access_level: 'public' },
      { id: 'd2', deal_id: DEMO_DEAL.id, type: 'document', url: '#', caption: 'Executive Summary', category: 'document', sort_order: 21, document_role: 'one_pager', description: 'Two-page overview highlighting key investment metrics, deal structure, business plan thesis, and projected returns.', pages: 2, file_size: '1.4 MB', file_type: 'PDF', access_level: 'public' },
      { id: 'd3', deal_id: DEMO_DEAL.id, type: 'document', url: '#', caption: 'Financial Summary', category: 'document', sort_order: 22, description: 'Detailed financial model including acquisition assumptions, renovation budget, projected cash flows, sensitivity analysis, and waterfall distribution schedule.', pages: 18, file_size: '3.6 MB', file_type: 'PDF', access_level: 'public' },
      { id: 'd4', deal_id: DEMO_DEAL.id, type: 'document', url: '#', caption: 'Market Research Report', category: 'document', sort_order: 23, description: 'In-depth analysis of the Indianapolis MSA and northeast submarket including employment data, demographic trends, rent comparables, and supply pipeline from The Gray Report.', pages: 24, file_size: '5.1 MB', file_type: 'PDF', access_level: 'public' },
      { id: 'd5', deal_id: DEMO_DEAL.id, type: 'document', url: '#', caption: 'Track Record Summary', category: 'document', sort_order: 24, description: 'Full-cycle deal performance across all 10 realized investments and 17 active properties. Includes case studies and aggregate return metrics.', pages: 8, file_size: '2.8 MB', file_type: 'PDF', access_level: 'public' },
      { id: 'd6', deal_id: DEMO_DEAL.id, type: 'document', url: '#', caption: 'Sample K-1', category: 'document', sort_order: 25, description: 'Example Schedule K-1 illustrating the tax benefits of cost segregation and accelerated depreciation for a $100,000 investment.', pages: 4, file_size: '0.9 MB', file_type: 'PDF', access_level: 'public' },
    ];
    return res.json({ media: demoMedia });
  } catch (err) {
    next(err);
  }
});

// GET /api/deal/:slug/market — Market analysis data
router.get('/:slug/market', async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (supabase) {
      const { data: deal } = await supabase
        .from('deals')
        .select('market_data')
        .eq('slug', slug)
        .single();

      return res.json({ market_data: deal?.market_data || null });
    }

    return res.json({ market_data: DEMO_DEAL.market_data || null });
  } catch (err) {
    next(err);
  }
});

// GET /api/deal/:slug/business-plan — Business plan data
router.get('/:slug/business-plan', async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (supabase) {
      const { data: deal } = await supabase
        .from('deals')
        .select('business_plan_data')
        .eq('slug', slug)
        .single();

      return res.json({ business_plan_data: deal?.business_plan_data || null });
    }

    return res.json({ business_plan_data: DEMO_DEAL.business_plan_data || null });
  } catch (err) {
    next(err);
  }
});

// POST /api/deal/:slug/ppm-request — PPM request form submission
router.post('/:slug/ppm-request', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email).toLowerCase();
    const accredited = !!req.body.accredited;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const { first_name, last_name } = parseName(name);
    const dealName = slug === (DEMO_DEAL?.slug || '') || slug === 'demo' ? DEMO_DEAL.name : slug;

    let hubspotContactId = null;
    if (hubspotCreateOrUpdateContact) {
      hubspotContactId = await hubspotCreateOrUpdateContact({
        email,
        first_name: first_name || 'Unknown',
        last_name: last_name || 'Investor',
        deal_slug: slug,
      }).catch((err) => {
        console.warn('[Deal] HubSpot contact create/update failed:', err.message);
        return null;
      });
    }

    if (hubspotContactId) {
      await onPPMRequested({
        hubspotContactId,
        investorName: name,
        investorEmail: email,
        dealName,
      }).catch((err) => console.warn('[Deal] PPM workflow failed:', err.message));
    }

    return res.json({ success: true, message: 'PPM request received.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/deal/:slug/indicate-interest — Interest indication form submission
router.post('/:slug/indicate-interest', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email).toLowerCase();
    const amount_range = sanitize(req.body.amount_range);
    const notes = sanitize(req.body.notes);

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const { first_name, last_name } = parseName(name);
    const dealName = slug === (DEMO_DEAL?.slug || '') || slug === 'demo' ? DEMO_DEAL.name : slug;

    let hubspotContactId = null;
    if (hubspotCreateOrUpdateContact) {
      hubspotContactId = await hubspotCreateOrUpdateContact({
        email,
        first_name: first_name || 'Unknown',
        last_name: last_name || 'Investor',
        deal_slug: slug,
      }).catch((err) => {
        console.warn('[Deal] HubSpot contact create/update failed:', err.message);
        return null;
      });
    }

    if (hubspotContactId) {
      await onInterestIndicated({
        hubspotContactId,
        investorName: name,
        investorEmail: email,
        dealName,
        amountRange: amount_range || null,
        notes: notes || null,
      }).catch((err) => console.warn('[Deal] Interest workflow failed:', err.message));
    }

    return res.json({ success: true, message: 'Interest indication received.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/deal/:slug/interest — Indicate Interest (authenticated, Supabase + HubSpot Deal)
router.post('/:slug/interest', requireAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { amount, timeline, notes } = req.body;
    const { investor_id, email } = req.investor;

    if (!amount || typeof amount !== 'string') {
      return res.status(400).json({ message: 'Amount is required.' });
    }

    const sanitizedNotes = typeof notes === 'string' ? notes.slice(0, 500) : '';
    const sanitizedTimeline = typeof timeline === 'string' ? timeline.slice(0, 100) : '';
    const dealName = slug === (DEMO_DEAL?.slug || '') ? DEMO_DEAL.name : slug;

    // 1. Save to Supabase investor_interests table
    if (supabase) {
      const { error } = await supabase.from('investor_interests').insert({
        investor_id,
        deal_slug: slug,
        amount,
        timeline: sanitizedTimeline || null,
        notes: sanitizedNotes || null,
      });
      if (error) console.warn('[Deal] investor_interests insert failed:', error.message);

      // Mark session as interest_indicated
      const sessionId = req.investor.session_id;
      if (sessionId) {
        await supabase
          .from('sessions')
          .update({ interest_indicated: true })
          .eq('id', sessionId);
      }
    }

    // 2. Get investor details for HubSpot
    let investorName = '';
    let hubspotContactId = null;

    if (supabase && investor_id) {
      const { data: inv } = await supabase
        .from('investors')
        .select('first_name, last_name, hubspot_contact_id')
        .eq('id', investor_id)
        .single();

      if (inv) {
        investorName = `${inv.first_name || ''} ${inv.last_name || ''}`.trim();
        hubspotContactId = inv.hubspot_contact_id;
      }
    }

    // 3. Create HubSpot Deal object
    if (hubspotContactId) {
      const dealId = await createDeal(hubspotContactId, {
        dealname: `${investorName} — ${dealName} Interest`,
        amount: amount.replace(/[^0-9.]/g, '') || '0',
        dealstage: 'qualifiedtobuy',
        gc_deal_room_indicated_amount: amount,
        gc_deal_room_interest_timeline: sanitizedTimeline,
      });

      // 4. Create HubSpot note
      await createNote(
        hubspotContactId,
        `Interest Indicated via Deal Room:\n\n` +
        `Deal: ${dealName}\n` +
        `Amount: ${amount}\n` +
        `Timeline: ${sanitizedTimeline || 'Not specified'}\n` +
        `Notes: ${sanitizedNotes || 'None'}\n\n` +
        `Investor: ${investorName} (${email})`
      );

      // 5. Update contact properties
      await updateContactPropertiesById(hubspotContactId, {
        gc_interest_indicated: 'true',
        gc_indicated_amount_range: amount,
      });
    }

    // Also fire existing workflow
    if (hubspotContactId) {
      await onInterestIndicated({
        hubspotContactId,
        investorName,
        investorEmail: email,
        dealName,
        amountRange: amount,
        notes: sanitizedNotes,
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Interest indication received.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
