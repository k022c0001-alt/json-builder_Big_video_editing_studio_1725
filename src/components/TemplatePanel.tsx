import React from 'react'
import { TemplateSelector } from './TemplateSelector'
import { TemplateInfo } from '../utils/templates'
import toolbarStyles from '../styles/toolbar.module.css'

interface TemplatePanelProps {
  onSelect?: (template: TemplateInfo) => void
}

/**
 * A toolbar row containing the template selector buttons.
 * Placed between the main toolbar and the split editor area.
 */
export function TemplatePanel({ onSelect }: TemplatePanelProps) {
  return (
    <div className={toolbarStyles.toolbarRow} role="region" aria-label="Templates">
      <span className={toolbarStyles.toolbarRowLabel}>📚 Templates</span>
      <TemplateSelector onSelect={onSelect} />
    </div>
  )
}
