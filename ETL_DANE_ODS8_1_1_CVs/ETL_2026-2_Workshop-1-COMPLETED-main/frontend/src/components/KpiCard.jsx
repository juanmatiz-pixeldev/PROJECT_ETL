import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) {
      setVal(0);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function KpiCard({ label, value, display, sub, icon, accent = '#0d9488', index = 0, variant = 'dark' }) {
  const animated = useCountUp(Number(value) || 0);
  const shown = display ? display(animated) : animated.toLocaleString('es-CO');
  return (
    <motion.div
      className={`kpi-card ${variant === 'light' ? 'light' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <div className="kpi-top">
        <span className="kpi-ico" style={{ background: `${accent}1f`, color: accent }}>
          {icon}
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{shown}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </motion.div>
  );
}
