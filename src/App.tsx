import React from 'react'
import { EditorLayout } from './components/Editor/EditorLayout'
import { TabContextProvider } from './components/TabContextProvider'

export default function App() {
  return (
    <TabContextProvider>
      <EditorLayout />
    </TabContextProvider>
  )
}
