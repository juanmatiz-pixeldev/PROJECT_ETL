import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';

export default function ChartCard({ id, badge, badgeClass = '', title, desc, icon, children, delay = 0, onExport }) {
  return (
    <motion.article
      className="card"
      id={id}
      style={{ scrollMarginTop: 76 }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -2 }}
    >
      <div className="card-header">
        <span className={`req-id ${badgeClass}`}>{badge}</span>
        <div style={{ flex: 1 }}>
          <h3>
            {icon && <span className="card-icon">{icon}</span>} {title}
          </h3>
          {desc && <p>{desc}</p>}
        </div>
        {onExport && (
          <button className="btn-mini" onClick={onExport} title="Descargar CSV de esta tabla">
            <FileSpreadsheet size={13} /> CSV
          </button>
        )}
      </div>
      <div className="card-body">{children}</div>
    </motion.article>
  );
}
