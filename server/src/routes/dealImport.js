'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const {
  parseOverviewCSV,
  parseSensitivityCSV,
  buildDealPayload,
  buildSensitivityPayload,
} = require('../services/csvParser');

const router = express.Router();

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase();
    if (
      ext.endsWith('.csv') ||
      ext.endsWith('.txt') ||
      file.mimetype === 'text/csv' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const uploadFields = csvUpload.fields([
  { name: 'overview', maxCount: 1 },
  { name: 'sensitivity', maxCount: 1 },
]);

// POST /deals/import — Import deal from CSV files
router.post('/deals/import', requireAdmin, (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const overviewFile = req.files?.overview?.[0];
    if (!overviewFile) {
      return res.status(400).json({ error: 'Overview CSV file is required' });
    }

    const warnings = [];

    const overviewCSV = overviewFile.buffer.toString('utf-8');
    const { fields: overviewFields, warnings: overviewWarnings } = parseOverviewCSV(overviewCSV);
    warnings.push(...overviewWarnings);

    const { deal: dealPayload, warnings: dealWarnings } = buildDealPayload(overviewFields);
    warnings.push(...dealWarnings);

    let sensitivityPayload = null;
    const sensitivityFile = req.files?.sensitivity?.[0];
    if (sensitivityFile) {
      const sensitivityCSV = sensitivityFile.buffer.toString('utf-8');
      const { sections, warnings: sensParseWarnings } = parseSensitivityCSV(sensitivityCSV);
      warnings.push(...sensParseWarnings);

      const { sensitivity, unit_mix, warnings: sensBuildWarnings } = buildSensitivityPayload(
        sections,
        dealPayload.slug,
        overviewFields,
      );
      warnings.push(...sensBuildWarnings);
      sensitivityPayload = sensitivity;
      if (unit_mix && unit_mix.length > 0) {
        dealPayload.unit_mix = unit_mix;
      }
    }

    if (!supabase) {
      warnings.push('Database not configured — deal not persisted');
      return res.json({
        success: true,
        deal_id: 'demo',
        deal_slug: dealPayload.slug,
        warnings,
        deal: dealPayload,
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('deals')
      .insert(dealPayload)
      .select('id, slug')
      .single();

    if (insertError) {
      console.error('[DealImport] Insert error:', insertError);
      return res.status(500).json({ error: `Database insert failed: ${insertError.message}` });
    }

    if (sensitivityPayload && inserted?.id) {
      const { error: sensError } = await supabase
        .from('deals')
        .update({ sensitivity_data: sensitivityPayload })
        .eq('id', inserted.id);

      if (sensError) {
        console.error('[DealImport] Sensitivity update error:', sensError);
        warnings.push(`Deal created but sensitivity data failed to save: ${sensError.message}`);
      }
    }

    return res.json({
      success: true,
      deal_id: inserted.id,
      deal_slug: inserted.slug,
      warnings,
    });
  } catch (err) {
    console.error('[DealImport] Parse/import error:', err);
    return res.status(400).json({ error: `CSV parsing failed: ${err.message}` });
  }
});

// GET /deals/import/template/:name — Download CSV template (no auth required)
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

router.get('/deals/import/template/:name', (req, res) => {
  const { name } = req.params;
  if (name !== 'overview' && name !== 'sensitivity') {
    return res.status(404).json({ error: 'Template not found. Use "overview" or "sensitivity".' });
  }

  const filePath = path.join(TEMPLATES_DIR, `deal_${name}.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Template file deal_${name}.csv not found on server` });
  }

  res.download(filePath, `deal_${name}_template.csv`);
});

module.exports = router;
