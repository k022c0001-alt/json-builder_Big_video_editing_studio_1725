import { useProjectStore } from 'shared/store/project.store'
import { TEMPLATES } from '../constants/templates'

function formatValue(value: string, type: string): string {
  if (type === 'number') return value
  if (type === 'boolean_true') return 'true'
  if (type === 'boolean_false') return 'false'
  if (type === 'null') return 'null'
  return value
}

export const useAddData = () => {
  const memoText = useProjectStore((s) => s.memoText)
  const setMemoText = useProjectStore((s) => s.setMemoText)

  const addKeyValue = (key: string, value: string, type: string) => {
    const formatted = formatValue(value, type)
    const newLine = `- ${key}: ${formatted}`
    setMemoText(memoText + '\n' + newLine)
  }

  const addSection = (name: string, level: number) => {
    const heading = '#'.repeat(level) + ' ' + name
    setMemoText(memoText + '\n\n' + heading)
  }

  const addArrayItem = (arrayName: string, item: string) => {
    const newLine = `- ${arrayName}: ${item}`
    setMemoText(memoText + '\n' + newLine)
  }

  const insertTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey]
    if (template) {
      setMemoText(template)
    }
  }

  return { addKeyValue, addSection, addArrayItem, insertTemplate }
}
