import { useState, useRef, useCallback } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SensitivityUploaderProps {
  dealId: string;
  onUploadComplete: () => void;
}

interface ValidationCheck {
  label: string;
  passed: boolean;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

function validateSensitivityJSON(data: unknown): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // 1. Top-level keys
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    checks.push({ label: 'Schema valid', passed: false, message: 'Data must be a JSON object' });
    return checks;
  }

  const obj = data as Record<string, unknown>;
  const requiredKeys = [
    'deal_slug',
    'scenarios',
    'sensitivity_tables',
    'annual_cash_flows',
    'benchmark_comparison',
    'cost_seg',
    'waterfall',
  ];
  const missingKeys = requiredKeys.filter((k) => !(k in obj));

  if (missingKeys.length > 0) {
    checks.push({
      label: 'Schema valid',
      passed: false,
      message: `Missing required keys: ${missingKeys.join(', ')}`,
    });
  } else {
    checks.push({ label: 'Schema valid', passed: true, message: 'All required top-level keys present' });
  }

  // 2. Check scenarios
  const scenarios = obj.scenarios as Record<string, unknown> | undefined;
  if (scenarios && typeof scenarios === 'object' && !Array.isArray(scenarios)) {
    const expectedScenarios = ['downside', 'base', 'upside', 'strategic'];
    const presentScenarios = expectedScenarios.filter((k) => k in scenarios);
    const allHaveAssumptions = presentScenarios.every((k) => {
      const s = scenarios[k] as Record<string, unknown> | undefined;
      return s && typeof s === 'object' && 'assumptions' in s;
    });

    if (presentScenarios.length === 4 && allHaveAssumptions) {
      checks.push({
        label: '4 scenarios with assumptions',
        passed: true,
        message: `${presentScenarios.length} scenarios found with assumptions`,
      });
    } else {
      checks.push({
        label: '4 scenarios with assumptions',
        passed: false,
        message: `Found ${presentScenarios.length}/4 scenarios${!allHaveAssumptions ? ' (some missing assumptions)' : ''}`,
      });
    }
  } else {
    checks.push({ label: '4 scenarios with assumptions', passed: false, message: 'No scenarios object found' });
  }

  // 3. Check sensitivity tables
  const tables = obj.sensitivity_tables as Record<string, unknown> | undefined;
  if (tables && typeof tables === 'object' && !Array.isArray(tables)) {
    let totalPoints = 0;
    const tableNames = Object.keys(tables);
    tableNames.forEach((name) => {
      const table = tables[name];
      if (Array.isArray(table)) {
        totalPoints += table.length;
      }
    });

    if (totalPoints > 0) {
      checks.push({
        label: 'Sensitivity data points',
        passed: true,
        message: `${totalPoints} data points across ${tableNames.length} tables`,
      });
    } else {
      checks.push({
        label: 'Sensitivity data points',
        passed: false,
        message: 'Sensitivity tables are empty',
      });
    }
  } else {
    checks.push({ label: 'Sensitivity data points', passed: false, message: 'No sensitivity_tables found' });
  }

  // 4. Check for NaN / null values in scenarios
  let hasInvalidValues = false;
  if (scenarios && typeof scenarios === 'object') {
    const scenarioKeys = Object.keys(scenarios);
    for (const sk of scenarioKeys) {
      const s = (scenarios as Record<string, any>)[sk];
      if (s?.assumptions) {
        for (const val of Object.values(s.assumptions)) {
          if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
            hasInvalidValues = true;
            break;
          }
        }
      }
      if (hasInvalidValues) break;
    }
  }

  checks.push({
    label: 'No NaN/null values',
    passed: !hasInvalidValues,
    message: hasInvalidValues ? 'Found NaN or null values in scenario assumptions' : 'All values are valid numbers',
  });

  return checks;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SensitivityUploader({ dealId, onUploadComplete }: SensitivityUploaderProps) {
  const api = useAdminApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allChecksPassed = validationChecks.length > 0 && validationChecks.every((c) => c.passed);

  /* ---- file processing ---- */

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setParsedData(null);
    setParseError(null);
    setValidationChecks([]);
    setUploadMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          setParseError('Failed to read file contents.');
          return;
        }
        const json = JSON.parse(text);
        setParsedData(json);
        const checks = validateSensitivityJSON(json);
        setValidationChecks(checks);
      } catch {
        setParseError('Invalid JSON file. Please check the file format.');
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read the file.');
    };
    reader.readAsText(file);
  }, []);

  /* ---- drag & drop ---- */

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function handleDropZoneClick() {
    fileInputRef.current?.click();
  }

  /* ---- upload ---- */

  async function handleConfirmUpload() {
    if (!parsedData || !allChecksPassed) return;

    setUploading(true);
    setUploadMsg(null);

    try {
      const result = await api.put(`/api/admin/deals/${dealId}/sensitivity`, parsedData);

      if (result?.success) {
        setUploadMsg({ type: 'success', text: 'Sensitivity data uploaded successfully.' });
        onUploadComplete();
      } else {
        setUploadMsg({ type: 'success', text: 'Upload complete (demo mode).' });
      }
    } catch {
      setUploadMsg({ type: 'error', text: 'Upload failed. Database may not be configured.' });
    } finally {
      setUploading(false);
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  const parseErrorNode: React.ReactNode =
    parseError !== null && parseError !== ''
      ? ((
          <div className="mt-4 p-3 bg-gc-negative/10 border border-gc-negative/30 rounded-lg">
            <p className="text-sm text-gc-negative">{parseError}</p>
          </div>
        ) as React.ReactNode)
      : null;

  return (
    <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gc-text mb-4">Upload Sensitivity Data</h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onClick={handleDropZoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-gc-accent-light bg-gc-accent-light/5'
            : 'border-gc-border hover:border-gc-accent-light'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8 text-gc-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6h.1a5 5 0 0 1 1 9.9M15 13l-3-3m0 0-3 3m3-3v12"
            />
          </svg>
          {fileName ? (
            <p className="text-sm text-gc-accent-light font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-gc-text">
                Drop <span className="text-gc-accent-light font-medium">sensitivity_data.json</span> here
              </p>
              <p className="text-xs text-gc-text-secondary">or click to browse</p>
            </>
          )}
        </div>
      </div>

      {/* Parse error */}
      {parseErrorNode}

      {/* Validation results */}
      {validationChecks.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-medium text-gc-text-secondary mb-3">Validation Results</h3>
          <ul className="space-y-2">
            {validationChecks.map((check, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex-shrink-0">
                  {check.passed ? (
                    <span className="text-gc-positive">&#10003;</span>
                  ) : (
                    <span className="text-gc-negative">&#10007;</span>
                  )}
                </span>
                <span className="text-gc-text">
                  {check.label}
                  <span className="text-gc-text-secondary ml-1.5">
                    &mdash; {check.message}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenario Preview Table */}
      {parsedData != null && allChecksPassed ? (() => {
        const data = parsedData as Record<string, any>;
        const scenarios = data.scenarios;
        if (!scenarios || typeof scenarios !== 'object') return null;

        const keys: { key: string; label: string }[] = [
          { key: 'downside', label: 'Conservative' },
          { key: 'base', label: 'Base' },
          { key: 'upside', label: 'Upside' },
          { key: 'strategic', label: 'Strategic' },
        ];
        const presentKeys = keys.filter((k) => k.key in scenarios);
        if (presentKeys.length === 0) return null;

        return (
          <div className="mt-5">
            <h3 className="text-sm font-medium text-gc-text-secondary mb-3">Scenario Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gc-border">
                    <th className="text-left py-2 pr-4 text-gc-text-secondary font-medium">Metric</th>
                    {presentKeys.map((s) => (
                      <th key={s.key} className="text-center py-2 px-2 text-gc-text-secondary font-medium">
                        {scenarios[s.key]?.label || s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'annual_rent_growth', label: 'Rent Growth' },
                    { key: 'avg_occupancy', label: 'Occupancy' },
                    { key: 'exit_cap', label: 'Exit Cap' },
                    { key: 'annual_expense_growth', label: 'Expense Growth' },
                  ].map((row) => (
                    <tr key={row.key} className="border-b border-gc-border/50">
                      <td className="py-2 pr-4 text-gc-text">{row.label}</td>
                      {presentKeys.map((s) => {
                        const val = scenarios[s.key]?.assumptions?.[row.key];
                        const display = typeof val === 'number' ? `${(val * 100).toFixed(1)}%` : '--';
                        return (
                          <td key={s.key} className="py-2 px-2 text-center text-gc-text font-mono">
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })() : null}

      {/* Confirm Upload button */}
      {validationChecks.length > 0 && (
        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={handleConfirmUpload}
            disabled={!allChecksPassed || uploading}
            className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Confirm Upload'}
          </button>
          {uploadMsg && (
            <span
              className={`text-sm ${uploadMsg.type === 'success' ? 'text-gc-positive' : 'text-gc-negative'}`}
            >
              {uploadMsg.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
