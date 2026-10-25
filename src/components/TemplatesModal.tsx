// Lumora Studio - Templates Gallery Modal
import React from 'react';
import { X, Sparkles, Video, Camera, Smartphone, Palette, Image as ImageIcon } from 'lucide-react';
import { DocumentProject, Layer } from '../types';
import { defaultAdjustments } from '../engine/Adjustments';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateDoc: DocumentProject) => void;
}

interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  description: string;
  generateDoc: () => DocumentProject;
}

export function generateCreativeNeonBrandingDoc(): DocumentProject {
  // Layer 1: Dark Slate Grid Background
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = 1200;
  bgCanvas.height = 800;
  const bgCtx = bgCanvas.getContext('2d');
  if (bgCtx) {
    bgCtx.fillStyle = '#090d16';
    bgCtx.fillRect(0, 0, 1200, 800);
    bgCtx.strokeStyle = '#1e293b';
    bgCtx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 60) {
      bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, 800); bgCtx.stroke();
    }
    for (let y = 0; y < 800; y += 60) {
      bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(1200, y); bgCtx.stroke();
    }
  }

  // Layer 2: Glowing Radial Sphere
  const orbCanvas = document.createElement('canvas');
  orbCanvas.width = 440;
  orbCanvas.height = 440;
  const octx = orbCanvas.getContext('2d');
  if (octx) {
    const grad = octx.createRadialGradient(220, 220, 20, 220, 220, 210);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#06b6d4');
    octx.fillStyle = grad;
    octx.beginPath();
    octx.arc(220, 220, 200, 0, Math.PI * 2);
    octx.fill();
  }

  // Layer 3: Cyan Ring
  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = 500;
  ringCanvas.height = 500;
  const rctx = ringCanvas.getContext('2d');
  if (rctx) {
    rctx.strokeStyle = '#06b6d4';
    rctx.lineWidth = 6;
    rctx.beginPath();
    rctx.arc(250, 250, 230, 0, Math.PI * 2);
    rctx.stroke();
  }

  const layers: Layer[] = [
    {
      id: 'layer_bg_' + Date.now(),
      name: 'Space Grid Background',
      type: 'image',
      visible: true,
      locked: true,
      opacity: 1,
      blendMode: 'source-over',
      x: 0,
      y: 0,
      width: 1200,
      height: 800,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: bgCanvas,
      adjustments: defaultAdjustments()
    },
    {
      id: 'layer_orb_' + Date.now(),
      name: 'Cosmic Gradient Orb',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 0.9,
      blendMode: 'screen',
      x: 380,
      y: 180,
      width: 440,
      height: 440,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: orbCanvas,
      adjustments: defaultAdjustments()
    },
    {
      id: 'layer_ring_' + Date.now(),
      name: 'Cyan Accent Ring',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 0.8,
      blendMode: 'screen',
      x: 350,
      y: 150,
      width: 500,
      height: 500,
      rotation: 15,
      scaleX: 1,
      scaleY: 1,
      canvas: ringCanvas,
      adjustments: defaultAdjustments()
    },
    {
      id: 'layer_text_' + Date.now(),
      name: 'Headline Text',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      x: 330,
      y: 640,
      width: 540,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas: document.createElement('canvas'),
      textConfig: {
        text: 'LUMORA CREATIVE STUDIO',
        fontSize: 36,
        fontFamily: 'Inter, sans-serif',
        color: '#ffffff',
        bold: true,
        italic: false
      },
      adjustments: defaultAdjustments()
    }
  ];

  return {
    id: 'doc_neon_' + Date.now(),
    name: 'Neon Creative Branding',
    width: 1200,
    height: 800,
    dpi: 72,
    background: 'transparent',
    layers,
    activeLayerId: layers[1].id,
    zoom: 1.0,
    panX: 0,
    panY: 0
  };
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  if (!isOpen) return null;

  const presets: TemplatePreset[] = [
    {
      id: 'neon_branding',
      name: 'Creative Neon Orb Branding',
      category: 'Design & Graphics',
      width: 1200,
      height: 800,
      icon: <Palette size={20} color="#06b6d4" />,
      description: 'Multi-layer PSD layout with radial glowing orb, space grid, and neon accents.',
      generateDoc: generateCreativeNeonBrandingDoc
    },
    {
      id: 'yt_thumbnail',
      name: 'YouTube Thumbnail (16:9)',
      category: 'Social Media',
      width: 1280,
      height: 720,
      icon: <Video size={20} color="#ef4444" />,
      description: '1280 × 720px preset with high-impact color splash and bold headline typography.',
      generateDoc: () => {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 1280;
        bgCanvas.height = 720;
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          const grad = bgCtx.createLinearGradient(0, 0, 1280, 720);
          grad.addColorStop(0, '#18181b');
          grad.addColorStop(1, '#3b0764');
          bgCtx.fillStyle = grad;
          bgCtx.fillRect(0, 0, 1280, 720);
        }

        const badgeCanvas = document.createElement('canvas');
        badgeCanvas.width = 240;
        badgeCanvas.height = 80;
        const bctx = badgeCanvas.getContext('2d');
        if (bctx) {
          bctx.fillStyle = '#ef4444';
          bctx.roundRect ? bctx.roundRect(0, 0, 240, 80, 12) : bctx.fillRect(0, 0, 240, 80);
          bctx.fill();
        }

        const layers: Layer[] = [
          {
            id: 'layer_yt_bg',
            name: 'Gradient Backdrop',
            type: 'image',
            visible: true,
            locked: true,
            opacity: 1,
            blendMode: 'source-over',
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas: bgCanvas,
            adjustments: defaultAdjustments()
          },
          {
            id: 'layer_yt_badge',
            name: 'Red Alert Badge',
            type: 'image',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            x: 80,
            y: 80,
            width: 240,
            height: 80,
            rotation: -3,
            scaleX: 1,
            scaleY: 1,
            canvas: badgeCanvas,
            adjustments: defaultAdjustments()
          },
          {
            id: 'layer_yt_text1',
            name: 'Badge Label',
            type: 'text',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            x: 105,
            y: 102,
            width: 200,
            height: 40,
            rotation: -3,
            scaleX: 1,
            scaleY: 1,
            canvas: document.createElement('canvas'),
            textConfig: {
              text: 'NEW 2026',
              fontSize: 32,
              fontFamily: 'Inter, sans-serif',
              color: '#ffffff',
              bold: true,
              italic: false
            },
            adjustments: defaultAdjustments()
          },
          {
            id: 'layer_yt_title',
            name: 'Main Title',
            type: 'text',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            x: 80,
            y: 200,
            width: 900,
            height: 180,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas: document.createElement('canvas'),
            textConfig: {
              text: 'HOW TO BUILD A PHOTO EDITOR\nIN YOUR BROWSER',
              fontSize: 54,
              fontFamily: 'Inter, sans-serif',
              color: '#facc15',
              bold: true,
              italic: false
            },
            adjustments: defaultAdjustments()
          }
        ];

        return {
          id: 'doc_yt_' + Date.now(),
          name: 'YouTube Thumbnail',
          width: 1280,
          height: 720,
          dpi: 72,
          background: 'transparent',
          layers,
          activeLayerId: 'layer_yt_title',
          zoom: 1.0,
          panX: 0,
          panY: 0
        };
      }
    },
    {
      id: 'insta_post',
      name: 'Instagram Square (1:1)',
      category: 'Social Media',
      width: 1080,
      height: 1080,
      icon: <Camera size={20} color="#ec4899" />,
      description: '1080 × 1080px square post with photo frame border and modern minimalist typography.',
      generateDoc: () => {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 1080;
        bgCanvas.height = 1080;
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          bgCtx.fillStyle = '#111827';
          bgCtx.fillRect(0, 0, 1080, 1080);
          bgCtx.strokeStyle = '#374151';
          bgCtx.lineWidth = 16;
          bgCtx.strokeRect(60, 60, 960, 960);
        }

        const layers: Layer[] = [
          {
            id: 'layer_insta_bg',
            name: 'Framed Background',
            type: 'image',
            visible: true,
            locked: true,
            opacity: 1,
            blendMode: 'source-over',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas: bgCanvas,
            adjustments: defaultAdjustments()
          },
          {
            id: 'layer_insta_title',
            name: 'Editorial Headline',
            type: 'text',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            x: 120,
            y: 460,
            width: 840,
            height: 160,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas: document.createElement('canvas'),
            textConfig: {
              text: 'MODERN AESTHETICS\nVOL. 01',
              fontSize: 58,
              fontFamily: 'Inter, sans-serif',
              color: '#ffffff',
              bold: true,
              italic: false
            },
            adjustments: defaultAdjustments()
          }
        ];

        return {
          id: 'doc_insta_' + Date.now(),
          name: 'Instagram Square Post',
          width: 1080,
          height: 1080,
          dpi: 72,
          background: 'transparent',
          layers,
          activeLayerId: 'layer_insta_title',
          zoom: 1.0,
          panX: 0,
          panY: 0
        };
      }
    },
    {
      id: 'story_vertical',
      name: 'Mobile Story / Reel (9:16)',
      category: 'Mobile',
      width: 1080,
      height: 1920,
      icon: <Smartphone size={20} color="#a855f7" />,
      description: '1080 × 1920px vertical ratio for TikTok, Reels, and Instagram Stories.',
      generateDoc: () => {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 1080;
        bgCanvas.height = 1920;
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          const grad = bgCtx.createLinearGradient(0, 0, 0, 1920);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e1b4b');
          grad.addColorStop(1, '#4c0519');
          bgCtx.fillStyle = grad;
          bgCtx.fillRect(0, 0, 1080, 1920);
        }

        const layers: Layer[] = [
          {
            id: 'layer_story_bg',
            name: 'Sunset Dark Gradient',
            type: 'image',
            visible: true,
            locked: true,
            opacity: 1,
            blendMode: 'source-over',
            x: 0,
            y: 0,
            width: 1080,
            height: 1920,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas: bgCanvas,
            adjustments: defaultAdjustments()
          },
          {
            id: 'layer_story_title',
            name: 'Story Title',
            type: 'text',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'source-over',
            x: 100,
            y: 800,
            width: 880,
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            canvas: document.createElement('canvas'),
            textConfig: {
              text: 'THE FUTURE OF\nPHOTO EDITING',
              fontSize: 68,
              fontFamily: 'Inter, sans-serif',
              color: '#38bdf8',
              bold: true,
              italic: false
            },
            adjustments: defaultAdjustments()
          }
        ];

        return {
          id: 'doc_story_' + Date.now(),
          name: 'Mobile Story Template',
          width: 1080,
          height: 1920,
          dpi: 72,
          background: 'transparent',
          layers,
          activeLayerId: 'layer_story_title',
          zoom: 1.0,
          panX: 0,
          panY: 0
        };
      }
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '680px', maxWidth: '92vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#3b82f6" />
            <span style={{ fontWeight: 600 }}>Choose a Design Template</span>
          </div>
          <button className="layer-action-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>
            Select a pre-designed template to immediately launch Lumora Studio with layered graphics, responsive aspect ratios, and editable typography:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectTemplate(preset.generateDoc());
                  onClose();
                }}
                style={{
                  backgroundColor: '#262626',
                  border: '1px solid #383838',
                  borderRadius: '6px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2675d9';
                  e.currentTarget.style.backgroundColor = '#2c2c2c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#383838';
                  e.currentTarget.style.backgroundColor = '#262626';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {preset.icon}
                    <span style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '13px' }}>
                      {preset.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#333',
                      color: '#9ca3af',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {preset.width} × {preset.height}
                  </span>
                </div>

                <p style={{ color: '#888', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
                  {preset.description}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="preset-btn"
                    style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: '#2675d9', color: '#fff', border: 'none', borderRadius: '4px' }}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
