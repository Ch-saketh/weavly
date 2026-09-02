import { useRef, useState, useCallback, useEffect } from 'react';
import './LineSidebar.css';

const FALLOFF_CURVES = {
  linear: p => p,
  smooth: p => p * p * (3 - 2 * p),
  sharp: p => p * p * p
};

const DEFAULT_ITEMS = [
  'Overview',
  'Components',
  'Animations',
  'Backgrounds',
  'Showcase'
];

const LineSidebar = ({
  items = DEFAULT_ITEMS,
  accentColor = '#183B56',
  textColor = '#5A7184',
  markerColor = '#183B56',
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 18,
  falloff = 'smooth',
  markerLength = 36,
  markerGap = 8,
  tickScale = 0.45,
  scaleTick = true,
  itemGap = 14,
  fontSize = 0.8125,
  smoothing = 70,
  defaultActive = null,
  activeId = null,
  onItemClick,
  className = ''
}) => {
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const targetsRef = useRef([]);
  const currentRef = useRef([]);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Derive initial active index
  const getInitialIndex = () => {
    if (activeId != null) {
      const idx = items.findIndex(it => (typeof it === 'object' ? it.id === activeId : it === activeId));
      if (idx !== -1) return idx;
    }
    return defaultActive;
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIndex);
  const activeRef = useRef(activeIndex);
  const smoothingRef = useRef(smoothing);
  activeRef.current = activeIndex;
  smoothingRef.current = smoothing;

  // Single rAF loop that eases every item's --effect toward its target
  const runFrame = useCallback(now => {
    // If first frame or long pause, bound dt
    if (!lastRef.current) lastRef.current = now;
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 10) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const itemElements = itemRefs.current;
    const len = itemsRef.current.length;

    for (let i = 0; i < len; i++) {
      const el = itemElements[i];
      if (!el) continue;
      const isItemActive = activeRef.current === i;
      const target = Math.max(targetsRef.current[i] || 0, isItemActive ? 1 : 0);
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.001;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty('--effect', value.toFixed(4));
      if (!settled) moving = true;
    }

    if (moving) {
      rafRef.current = requestAnimationFrame(runFrame);
    } else {
      rafRef.current = null;
      lastRef.current = 0;
    }
  }, []);

  // startLoop does NOT cancel an already running frame; it lets it run fluidly
  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  // Sync with activeId prop changes
  useEffect(() => {
    if (activeId != null) {
      const idx = items.findIndex(it => (typeof it === 'object' ? it.id === activeId : it === activeId));
      if (idx !== -1 && idx !== activeRef.current) {
        setActiveIndex(idx);
        activeRef.current = idx;
        startLoop();
      }
    }
  }, [activeId, items, startLoop]);

  // Initialize targets and current array refs
  useEffect(() => {
    const len = items.length;
    targetsRef.current = new Array(len).fill(0);
    currentRef.current = new Array(len).fill(0);
    if (activeRef.current != null && activeRef.current >= 0 && activeRef.current < len) {
      currentRef.current[activeRef.current] = 1;
      const el = itemRefs.current[activeRef.current];
      if (el) el.style.setProperty('--effect', '1.0000');
    }
    startLoop();
  }, [items.length, startLoop]);

  const handlePointerMove = useCallback(
    e => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.smooth;
      const itemElements = itemRefs.current;
      const len = itemsRef.current.length;

      for (let i = 0; i < len; i++) {
        const el = itemElements[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / proximityRadius));
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    const len = itemsRef.current.length;
    for (let i = 0; i < len; i++) {
      targetsRef.current[i] = 0;
    }
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index, item) => {
      setActiveIndex(index);
      activeRef.current = index;
      startLoop();
      const label = typeof item === 'object' ? item.label : item;
      onItemClick?.(index, label, item);
    },
    [onItemClick, startLoop]
  );

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  return (
    <nav
      className={`line-sidebar${showMarker ? ' line-sidebar--markers' : ''}${scaleTick ? ' line-sidebar--scale-tick' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`
      }}
    >
      <ul
        ref={listRef}
        className="line-sidebar__list"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={startLoop}
      >
        {items.map((item, index) => {
          const label = typeof item === 'object' ? item.label : item;
          const Icon = typeof item === 'object' && item.icon ? item.icon : null;
          const isActive = activeIndex === index;

          return (
            <li
              key={`${label}-${index}`}
              ref={el => {
                itemRefs.current[index] = el;
              }}
              className="line-sidebar__item"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => handleClick(index, item)}
            >
              {showMarker && <span className="line-sidebar__marker" aria-hidden="true" />}
              <span className="line-sidebar__label">
                {showIndex && <span className="line-sidebar__index">{String(index + 1).padStart(2, '0')}</span>}
                {Icon && (
                  <span className="inline-flex mr-2 shrink-0">
                    <Icon size={14} strokeWidth={2.2} />
                  </span>
                )}
                <span className="line-sidebar__text">{label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LineSidebar;
