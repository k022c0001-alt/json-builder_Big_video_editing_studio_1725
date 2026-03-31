import React from 'react'
import styles from '../styles/editor.module.css'

type JsonPrimitive = string | number | boolean | null
type JsonNode = JsonPrimitive | Record<string, unknown> | unknown[]

interface JsonTreeViewProps {
  data: JsonNode
  keyName?: string
  isLast?: boolean
}

export function JsonTreeView({ data, keyName, isLast = true }: JsonTreeViewProps) {
  const comma = isLast ? '' : ','

  if (data === null) {
    return (
      <li className={styles.jsonNode}>
        {keyName !== undefined && (
          <>
            <span className={styles.jsonKey}>&quot;{keyName}&quot;</span>
            <span className={styles.jsonColon}>: </span>
          </>
        )}
        <span className={styles.jsonValueNull}>null</span>
        {comma}
      </li>
    )
  }

  if (typeof data === 'boolean') {
    return (
      <li className={styles.jsonNode}>
        {keyName !== undefined && (
          <>
            <span className={styles.jsonKey}>&quot;{keyName}&quot;</span>
            <span className={styles.jsonColon}>: </span>
          </>
        )}
        <span className={styles.jsonValueBoolean}>{String(data)}</span>
        {comma}
      </li>
    )
  }

  if (typeof data === 'number') {
    return (
      <li className={styles.jsonNode}>
        {keyName !== undefined && (
          <>
            <span className={styles.jsonKey}>&quot;{keyName}&quot;</span>
            <span className={styles.jsonColon}>: </span>
          </>
        )}
        <span className={styles.jsonValueNumber}>{data}</span>
        {comma}
      </li>
    )
  }

  if (typeof data === 'string') {
    return (
      <li className={styles.jsonNode}>
        {keyName !== undefined && (
          <>
            <span className={styles.jsonKey}>&quot;{keyName}&quot;</span>
            <span className={styles.jsonColon}>: </span>
          </>
        )}
        <span className={styles.jsonValueString}>&quot;{data}&quot;</span>
        {comma}
      </li>
    )
  }

  if (Array.isArray(data)) {
    return (
      <li className={styles.jsonNode}>
        {keyName !== undefined && (
          <>
            <span className={styles.jsonKey}>&quot;{keyName}&quot;</span>
            <span className={styles.jsonColon}>: </span>
          </>
        )}
        <span className={styles.jsonBracket}>[</span>
        {data.length > 0 && (
          <ul className={styles.jsonTreeNested}>
            {data.map((item, idx) => (
              <JsonTreeView
                key={idx}
                data={item as JsonNode}
                isLast={idx === data.length - 1}
              />
            ))}
          </ul>
        )}
        <span className={styles.jsonBracket}>]</span>
        {comma}
      </li>
    )
  }

  // Object
  const obj = data as Record<string, unknown>
  const keys = Object.keys(obj)

  return (
    <li className={styles.jsonNode}>
      {keyName !== undefined && (
        <>
          <span className={styles.jsonKey}>&quot;{keyName}&quot;</span>
          <span className={styles.jsonColon}>: </span>
        </>
      )}
      <span className={styles.jsonBracket}>{'{'}</span>
      {keys.length > 0 && (
        <ul className={styles.jsonTreeNested}>
          {keys.map((k, idx) => (
            <JsonTreeView
              key={k}
              data={obj[k] as JsonNode}
              keyName={k}
              isLast={idx === keys.length - 1}
            />
          ))}
        </ul>
      )}
      <span className={styles.jsonBracket}>{'}'}</span>
      {comma}
    </li>
  )
}
