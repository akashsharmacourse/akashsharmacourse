import { useState } from 'react'
import { FileText, Download, ExternalLink, RefreshCw } from 'lucide-react'
import styles from './PDFViewer.module.css'

export default function PDFViewer({ url, title }) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={styles.container}>
      {/* Header bar with controls */}
      <div className={styles.header}>
        <div className={styles.left}>
          <FileText size={18} className={styles.pdfIcon} />
          <span className={styles.title}>{title || 'Document Resource'}</span>
        </div>
        <div className={styles.right}>
          <a
            href={url}
            download
            className={styles.actionBtn}
            title="Download PDF"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={15} />
            <span>Download</span>
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
            title="Open in New Tab"
          >
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Embedded Iframe PDF viewer */}
      <div className={styles.viewer}>
        {isLoading && (
          <div className={styles.loader}>
            <RefreshCw size={32} className={styles.spinner} />
            <p>Loading document details...</p>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0`}
          title={title}
          className={styles.iframe}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  )
}
