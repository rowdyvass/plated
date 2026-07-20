/**
 * LabScreen — the Phase 1 "feel lab" for the rebuild (see REDESIGN.md).
 *
 * One dish (Sole Meunière), no targets, no timer, no score. Free plating on a
 * lit scene: drag food from the tray, paint beurre noisette as fluid sauce,
 * flick parsley to scatter it, then take The Pass for the beauty shot.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabRenderer } from './renderer';
import { FOOD_THUMBNAILS } from './textures';
import { labAudio } from './audio';
import type { LabItemKind } from './model';

type InteractionMode = 'paint' | 'drag' | null;

const TRAY_ITEMS: { kind: LabItemKind; label: string }[] = [
  { kind: 'sole', label: 'Sole' },
  { kind: 'quenelle', label: 'Beurre' },
  { kind: 'lemon', label: 'Citron' },
  { kind: 'parsley', label: 'Persil' },
];

function SauceIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9">
      <defs>
        <linearGradient id="labSauce" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5712c" />
          <stop offset="1" stopColor="#6f4716" />
        </linearGradient>
      </defs>
      <path
        d="M 8 34 Q 16 18 30 22 Q 42 26 40 14"
        stroke="url(#labSauce)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="38" r="2.6" fill="#8a5a20" />
    </svg>
  );
}

export function LabScreen() {
  const navigate = useNavigate();
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<LabRenderer | null>(null);
  const modeRef = useRef<InteractionMode>(null);
  const sauceArmedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [sauceArmed, setSauceArmed] = useState(false);
  const [passMode, setPassMode] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new LabRenderer();
    rendererRef.current = renderer;
    let cancelled = false;
    void renderer.init(host).then(() => {
      if (!cancelled) setReady(true);
      if (import.meta.env.DEV) {
        (window as unknown as { __lab?: LabRenderer }).__lab = renderer;
      }
    });
    return () => {
      cancelled = true;
      renderer.destroy();
      rendererRef.current = null;
      labAudio.destroy();
    };
  }, []);

  const canvasPoint = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = hostRef.current?.getBoundingClientRect();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  }, []);

  // Window-level move/up so drags survive leaving the canvas or the tray
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      const p = canvasPoint(e);
      if (modeRef.current === 'paint') renderer.sauceMove(p);
      else if (modeRef.current === 'drag') renderer.dragMove(p);
    };
    const onUp = (e: PointerEvent) => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      const p = canvasPoint(e);
      if (modeRef.current === 'paint') {
        renderer.sauceEnd(p);
      } else if (modeRef.current === 'drag') {
        // Releasing back over the tray discards instead of plating
        const overTray = (e.target as HTMLElement | null)?.closest?.('[data-lab-tray]');
        if (overTray) renderer.dragCancel();
        else renderer.dragDrop(p);
      }
      modeRef.current = null;
    };
    const onWheel = (e: WheelEvent) => {
      if (modeRef.current === 'drag') {
        e.preventDefault();
        rendererRef.current?.rotateDrag(e.deltaY * 0.0022);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && modeRef.current === 'drag') {
        rendererRef.current?.rotateDrag(Math.PI / 12);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [canvasPoint]);

  const handleCanvasDown = (e: React.PointerEvent) => {
    const renderer = rendererRef.current;
    if (!renderer || !renderer.isReady || passMode) return;
    labAudio.ensure();
    const p = canvasPoint(e);
    if (sauceArmedRef.current) {
      renderer.sauceStart(p);
      modeRef.current = 'paint';
    } else if (renderer.pickAt(p)) {
      modeRef.current = 'drag';
    }
  };

  const handleTrayItemDown = (kind: LabItemKind) => (e: React.PointerEvent) => {
    const renderer = rendererRef.current;
    if (!renderer || !renderer.isReady || passMode) return;
    e.preventDefault();
    labAudio.ensure();
    sauceArmedRef.current = false;
    setSauceArmed(false);
    renderer.dragStart(kind, canvasPoint(e));
    modeRef.current = 'drag';
  };

  const toggleSauce = () => {
    labAudio.ensure();
    const next = !sauceArmedRef.current;
    sauceArmedRef.current = next;
    setSauceArmed(next);
  };

  const handlePass = async () => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    setPassMode(true);
    await renderer.pass();
  };

  const handleResume = () => {
    rendererRef.current?.resume();
    setPassMode(false);
  };

  return (
    <div className="fixed inset-0 bg-[#2c1f15] overflow-hidden select-none">
      {/* The scene */}
      <div
        ref={hostRef}
        className="absolute inset-0"
        style={{ cursor: sauceArmed ? 'crosshair' : 'default', touchAction: 'none' }}
        onPointerDown={handleCanvasDown}
      />

      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 transition-opacity duration-500 ${
          passMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => navigate('/')}
          className="text-[#d8c9b2] hover:text-white text-sm tracking-[0.2em] font-body"
        >
          ← PLATED
        </button>
        <div className="text-center">
          <div className="font-display text-xl text-[#f3ead8] tracking-wide">Sole Meunière</div>
          <div className="text-[10px] text-[#a8977e] tracking-[0.25em] uppercase">
            Feel Lab · no targets · no timer
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => rendererRef.current?.undo()}
            className="px-3 py-1.5 text-xs tracking-[0.15em] text-[#d8c9b2] border border-[#5d4a35] rounded-full hover:border-[#a8977e] hover:text-white transition-colors"
          >
            UNDO
          </button>
          <button
            onClick={() => rendererRef.current?.clearAll()}
            className="px-3 py-1.5 text-xs tracking-[0.15em] text-[#d8c9b2] border border-[#5d4a35] rounded-full hover:border-[#a8977e] hover:text-white transition-colors"
          >
            CLEAR
          </button>
          <button
            onClick={handlePass}
            className="px-4 py-1.5 text-xs tracking-[0.15em] text-[#2c1f15] bg-[#c9a227] rounded-full hover:bg-[#e0bb3f] transition-colors font-medium"
          >
            THE PASS
          </button>
        </div>
      </div>

      {/* Hint */}
      <div
        className={`absolute top-20 left-1/2 -translate-x-1/2 text-[11px] text-[#8f7d64] tracking-wide transition-opacity duration-500 ${
          passMode || !ready ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {sauceArmed
          ? 'Draw slowly to pool the beurre noisette · flick to spatter'
          : 'Drag from the tray · drag placed food to move it · scroll or R rotates while carrying'}
      </div>

      {/* Tray */}
      <div
        data-lab-tray
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 ${
          passMode ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-end gap-3 px-5 py-3 rounded-2xl bg-[#f7f2e9]/95 shadow-2xl border border-[#e2d7c3]">
          <button
            onClick={toggleSauce}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              sauceArmed ? 'bg-[#8a5a20]/15 ring-2 ring-[#8a5a20]' : 'hover:bg-black/5'
            }`}
          >
            <SauceIcon />
            <span className="text-[10px] tracking-[0.15em] text-[#6b5637] uppercase">Beurre Noisette</span>
          </button>
          <div className="w-px h-12 bg-[#e2d7c3]" />
          {TRAY_ITEMS.map((item) => (
            <button
              key={item.kind}
              onPointerDown={handleTrayItemDown(item.kind)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors cursor-grab active:cursor-grabbing"
            >
              <img
                src={FOOD_THUMBNAILS[item.kind]}
                alt={item.label}
                draggable={false}
                className="h-9 w-auto max-w-[64px] object-contain pointer-events-none"
              />
              <span className="text-[10px] tracking-[0.15em] text-[#6b5637] uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pass-mode resume */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-700 ${
          passMode ? 'opacity-100 delay-700' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={handleResume}
          className="px-5 py-2 text-xs tracking-[0.25em] text-[#d8c9b2] border border-[#5d4a35] rounded-full hover:text-white hover:border-[#a8977e] transition-colors"
        >
          RETURN TO THE LINE
        </button>
      </div>

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2c1f15]">
          <div className="text-[#a8977e] text-sm tracking-[0.3em] font-display italic">
            Mise en place…
          </div>
        </div>
      )}
    </div>
  );
}
