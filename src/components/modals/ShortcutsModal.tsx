import React, { useState, useMemo } from 'react'
import { validateKeybind } from '../../../shared/parser/shortcutParser'
import styles from '../../styles/adddata.module.css'

interface ShortcutRow {
  keybind: string
  action: string
}

interface Category {
  name: string
  rows: ShortcutRow[]
}

type Platform = 'Win' | 'Mac'

interface Props {
  onInsert: (markdown: string) => void
  onClose: () => void
}

function buildMarkdown(appName: string, categories: Category[]): string {
  const lines: string[] = []

  if (appName.trim()) {
    lines.push(`# ${appName.trim()}`)
    lines.push('')
  }

  lines.push('## @shortcuts')

  for (const cat of categories) {
    if (!cat.name.trim()) continue
    lines.push('')
    lines.push(`### ${cat.name.trim()}`)
    for (const row of cat.rows) {
      if (row.keybind.trim() && row.action.trim()) {
        lines.push(`- ${row.keybind.trim()}: ${row.action.trim()}`)
      }
    }
  }

  return lines.join('\n')
}

function buildJsonPreview(appName: string, categories: Category[]): string {
  const shortcuts: Record<string, Record<string, string>> = {}

  for (const cat of categories) {
    if (!cat.name.trim()) continue
    const catEntries: Record<string, string> = {}
    for (const row of cat.rows) {
      if (row.keybind.trim() && row.action.trim()) {
        catEntries[row.action.trim()] = row.keybind.trim()
      }
    }
    if (Object.keys(catEntries).length > 0) {
      shortcuts[cat.name.trim()] = catEntries
    }
  }

  const obj: Record<string, unknown> = {}
  if (appName.trim()) obj.name = appName.trim()
  obj.shortcuts = shortcuts

  return JSON.stringify(obj, null, 2)
}

const DEFAULT_ROW: ShortcutRow = { keybind: '', action: '' }

export function ShortcutsModal({ onInsert, onClose }: Props) {
  const [appName, setAppName] = useState('')
  const [platform, setPlatform] = useState<Platform>('Win')
  const [categories, setCategories] = useState<Category[]>([
    { name: 'General', rows: [{ ...DEFAULT_ROW }] },
  ])
  const [showPreview, setShowPreview] = useState(false)

  const previewJson = useMemo(() => buildJsonPreview(appName, categories), [appName, categories])
  const primaryModifier = platform === 'Mac' ? 'Cmd' : 'Ctrl'

  // ── category helpers ──────────────────────────────────────

  const addCategory = () => {
    setCategories((prev) => [...prev, { name: '', rows: [{ ...DEFAULT_ROW }] }])
  }

  const updateCategoryName = (catIdx: number, name: string) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === catIdx ? { ...c, name } : c)),
    )
  }

  const removeCategory = (catIdx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== catIdx))
  }

  // ── row helpers ───────────────────────────────────────────

  const updateRow = (catIdx: number, rowIdx: number, field: keyof ShortcutRow, value: string) => {
    setCategories((prev) =>
      prev.map((c, ci) =>
        ci !== catIdx
          ? c
          : {
              ...c,
              rows: c.rows.map((r, ri) => (ri === rowIdx ? { ...r, [field]: value } : r)),
            },
      ),
    )
  }

  const addRow = (catIdx: number) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === catIdx ? { ...c, rows: [...c.rows, { ...DEFAULT_ROW }] } : c)),
    )
  }

  const removeRow = (catIdx: number, rowIdx: number) => {
    setCategories((prev) =>
      prev.map((c, ci) =>
        ci !== catIdx ? c : { ...c, rows: c.rows.filter((_, ri) => ri !== rowIdx) },
      ),
    )
  }

  // ── insert ────────────────────────────────────────────────

  const handleInsert = () => {
    const markdown = buildMarkdown(appName, categories)
    onInsert(markdown)
    onClose()
  }

  const hasContent = categories.some((c) =>
    c.rows.some((r) => r.keybind.trim() && r.action.trim()),
  )

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>⌨️ Shortcuts Wizard</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* App name + platform toggle */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className={styles.formField} style={{ flex: 1 }}>
              <label className={styles.formLabel}>App / Config Name</label>
              <input
                className={styles.formInput}
                placeholder="e.g. My App Shortcuts"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Platform</label>
              <select
                className={styles.formSelect}
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                <option value="Win">Windows / Linux</option>
                <option value="Mac">Mac (Cmd key)</option>
              </select>
            </div>
          </div>

          {/* Category hint */}
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #888)' }}>
            Primary modifier on this platform: <strong>{primaryModifier}</strong>
          </p>

          {/* Categories */}
          {categories.map((cat, catIdx) => (
            <div
              key={catIdx}
              style={{
                border: '1px solid var(--border, #3e3e3e)',
                borderRadius: 6,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Category header */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className={styles.formInput}
                  style={{ flex: 1, fontSize: 12, fontWeight: 600 }}
                  placeholder="Category name (e.g. File, Edit)"
                  value={cat.name}
                  onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                />
                {categories.length > 1 && (
                  <button
                    className={styles.btnSecondary}
                    style={{ padding: '4px 8px', fontSize: 11 }}
                    onClick={() => removeCategory(catIdx)}
                    title="Remove category"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Rows */}
              {cat.rows.map((row, rowIdx) => {
                const keybindValid = !row.keybind || validateKeybind(row.keybind)
                return (
                  <div key={rowIdx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      className={styles.formInput}
                      style={{
                        flex: '0 0 130px',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        borderColor: row.keybind && !keybindValid ? '#e05555' : undefined,
                      }}
                      placeholder={`${primaryModifier}+S`}
                      value={row.keybind}
                      onChange={(e) => updateRow(catIdx, rowIdx, 'keybind', e.target.value)}
                    />
                    <span style={{ color: 'var(--text-muted, #888)', fontSize: 12 }}>→</span>
                    <input
                      className={styles.formInput}
                      style={{ flex: 1, fontSize: 12 }}
                      placeholder="Action description"
                      value={row.action}
                      onChange={(e) => updateRow(catIdx, rowIdx, 'action', e.target.value)}
                    />
                    {cat.rows.length > 1 && (
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: '4px 8px', fontSize: 11, flexShrink: 0 }}
                        onClick={() => removeRow(catIdx, rowIdx)}
                        title="Remove row"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}

              <button
                className={styles.btnSecondary}
                style={{ alignSelf: 'flex-start', fontSize: 11, padding: '4px 10px' }}
                onClick={() => addRow(catIdx)}
              >
                + Add Shortcut
              </button>
            </div>
          ))}

          <button
            className={styles.btnSecondary}
            style={{ alignSelf: 'flex-start', fontSize: 12 }}
            onClick={addCategory}
          >
            + Add Category
          </button>

          {/* Preview toggle */}
          <div>
            <button
              className={styles.btnSecondary}
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? '▲ Hide Preview' : '▼ Preview JSON'}
            </button>
            {showPreview && (
              <pre
                style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  background: 'var(--bg-primary, #1e1e1e)',
                  border: '1px solid var(--border, #3e3e3e)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--text-primary, #d4d4d4)',
                  overflowX: 'auto',
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {previewJson}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleInsert} disabled={!hasContent}>
            Insert into Memo
          </button>
        </div>
      </div>
    </div>
  )
}
