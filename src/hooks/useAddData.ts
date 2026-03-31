import { useProjectStore } from 'shared/store/project.store'
import { TEMPLATES } from '../constants/templates'

function formatValue(value: string, type: string): string {
  switch (type) {
    case 'number':
      return value
    case 'boolean_true':
      return 'true'
    case 'boolean_false':
      return 'false'
    case 'null':
      return 'null'
    default:
      return value
  }
}

export const useAddData = () => {
  const memoText = useProjectStore((s) => s.memoText)
  const setMemoText = useProjectStore((s) => s.setMemoText)

  const addKeyValue = (key: string, value: string, type: string) => {
    const newLine = `- ${key}: ${formatValue(value, type)}`
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
