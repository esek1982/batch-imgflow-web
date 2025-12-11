import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Zap, Settings, RefreshCw, Type, Shield, Download, 
  ImageIcon, Plus, X, Loader2, Sliders, Wand2, Info, Grid, Check, RotateCw, Maximize, Palette, LayoutGrid
} from 'lucide-react';

// ==========================================
// ⚠️ ISTRUZIONI PRODUZIONE (ANDROID)
// ==========================================
// Quando compili per Android, DECOMMENTA queste righe:
/*
import { Camera } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
*/

// --- MOCK PER IL WEB (Per evitare crash se le librerie mancano) ---
// Se non usi Capacitor nel browser, questi oggetti evitano errori di "undefined"
const Camera = { pickImages: async () => { throw new Error("Web fallback"); } };
const Filesystem = { writeFile: async () => console.log("Salvataggio simulato web") };
const Preferences = { get: async () => ({ value: null }) };
const Toast = { show: async ({ text }) => alert(text) };


// --- STILI GLOBALI (CSS RESET & SCROLLBAR HIDE) ---
// Questo blocco inietta CSS nel browser per nascondere le scrollbar e togliere il margine bianco
const globalStyleInjection = `
  body, html { margin: 0; padding: 0; box-sizing: border-box; background-color: #09090b; height: 100%; width: 100%; overflow: hidden; }
  /* Nascondi scrollbar Webkit */
  ::-webkit-scrollbar { display: none; }
  /* Nascondi scrollbar Firefox */
  * { scrollbar-width: none; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = globalStyleInjection;
  // Evita duplicati
  if (!document.head.querySelector('style[data-app-styles="true"]')) {
      styleSheet.setAttribute('data-app-styles', 'true');
      document.head.appendChild(styleSheet);
  }
}

// --- CONFIGURAZIONE COLORI ---
const colors = {
  bg: '#09090b', surface: '#18181b', border: '#27272a',
  text: '#e4e4e7', textMuted: '#71717a',
  primary: '#10b981', accent: '#8b5cf6', white: '#ffffff', black: '#000000'
};

// --- STILI CSS-IN-JS ---
const s = {
  // CONTAINER PRINCIPALE: Modificato per centrare l'app su desktop (Simulazione Mobile)
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100vh', 
    backgroundColor: colors.bg, 
    color: colors.text, 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
    paddingTop: 'env(safe-area-inset-top)', 
    overflow: 'hidden',
    // Fix per Desktop
    maxWidth: '500px',     // Larghezza massima tipo telefono
    margin: '0 auto',      // Centrato orizzontalmente
    position: 'relative',
    boxShadow: '0 0 40px rgba(0,0,0,0.5)', // Ombra estetica su PC
    borderLeft: `1px solid ${colors.border}`,
    borderRight: `1px solid ${colors.border}`
  },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surface, zIndex: 50 },
  logoBox: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg },

  main: { flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: '200px' },

  // Card & Grid
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' },
  card: { position: 'relative', aspectRatio: '4/5', backgroundColor: colors.surface, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.border}` },
  imgFull: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  splitRight: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.3)', zIndex: 10 },
  imgSplit: { position: 'absolute', top: 0, left: '-100%', width: '200%', height: '100%', maxWidth: 'none', objectFit: 'cover' },

  // Labels
  badgeContainer: { position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 20 },
  badge: (isRaw) => ({ fontSize: '8px', fontWeight: 'bold', color: isRaw ? 'rgba(255,255,255,0.6)' : colors.primary, backgroundColor: 'rgba(0,0,0,0.7)', padding: '2px 4px', borderRadius: '4px' }),

  emptyState: { marginTop: '40px', border: `2px dashed ${colors.border}`, borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(39,39,42,0.2)' },

  // Footer: Aggiornato per rimanere dentro il contenitore da 500px
  footer: { 
    position: 'fixed', 
    bottom: 0, 
    // Trucco per centrare un elemento fixed dentro un container centrato
    left: '50%', 
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '500px', // Deve combaciare con s.container.maxWidth
    
    backgroundColor: colors.bg, 
    borderTop: `1px solid ${colors.border}`, 
    borderTopLeftRadius: '20px', 
    borderTopRightRadius: '20px', 
    paddingBottom: 'env(safe-area-inset-bottom)', 
    zIndex: 40, 
    boxShadow: '0 -10px 40px rgba(0,0,0,0.8)' 
  },
  
  tabBar: { display: 'flex', justifyContent: 'space-around', padding: '8px 0', borderBottom: `1px solid ${colors.border}` },
  tabBtn: (isActive) => ({ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: isActive ? colors.primary : colors.textMuted, fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }),

  controlArea: { padding: '16px', height: '160px', overflowY: 'auto' },
  actionRow: { display: 'flex', gap: '8px', padding: '12px 16px', backgroundColor: colors.bg },

  // UI Components
  toggleContainer: { display: 'flex', backgroundColor: colors.surface, borderRadius: '8px', padding: '3px', border: `1px solid ${colors.border}`, width: 'fit-content' },
  toggleBtn: (isActive) => ({
    border: 'none', background: isActive ? colors.primary : 'transparent',
    color: isActive ? colors.black : colors.textMuted,
    borderRadius: '6px', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
  }),

  label: { fontSize: '10px', color: colors.textMuted, marginBottom: '4px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' },
  input: { width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surface, color: colors.text, fontSize: '12px', outline: 'none' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  range: { width: '100%', accentColor: colors.primary, height: '4px', cursor: 'pointer', marginTop: '4px' },

  posGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', width: '60px', height: '60px', backgroundColor: colors.surface, padding: '2px', borderRadius: '6px', border: `1px solid ${colors.border}` },
  posCell: (active) => ({ backgroundColor: active ? colors.primary : colors.bg, border: 'none', borderRadius: '2px', cursor: 'pointer' }),

  btn: { border: 'none', borderRadius: '12px', padding: '0 16px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' },
};

// --- COMPONENTI HELPER ---
const SegmentedToggle = ({ options, value, onChange }) => (
  <div style={s.toggleContainer}>
    {options.map(opt => (
      <button key={opt.value} onClick={() => onChange(opt.value)} style={s.toggleBtn(value === opt.value)}>
        {opt.label}
      </button>
    ))}
  </div>
);

// --- APP COMPONENT ---
export default function App() {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('enhance');
  const [appMode, setAppMode] = useState('quick');
  const [autoTrigger, setAutoTrigger] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const fileInputRef = useRef(null);
  const watermarkInputRef = useRef(null);

  const [settings, setSettings] = useState({
    aiEnhance: false, aiIntensity: 50,
    exposureEnabled: false, exposure: 0,
    contrastEnabled: false, contrast: 0,
    upscale: false, grayscale: false,
    resizeEnabled: false, resizeMode: 'percent', widthPercent: 100, targetWidthPx: 1920, targetHeightPx: 1080, dpi: 300,
    watermarkEnabled: false, watermarkType: 'text', watermarkText: '© BatchFlow', watermarkImage: null,
    watermarkOpacity: 50, watermarkPosition: 'bottom-right', watermarkFont: 'sans-serif',
    watermarkRotation: 0, watermarkSize: 20, watermarkTile: false, watermarkColor: '#ffffff',
    format: 'image/jpeg', quality: 0.9, prefix: 'Batch_', renameEnabled: true
  });

  // Init
  useEffect(() => {
    const init = async () => {
      try { await Preferences.get({ key: 'privacy_accepted' }); } catch(e) {}
    };
    init();
  }, []);

  // Trigger Processor
  useEffect(() => {
    if (images.length === 0) return;
    setIsProcessing(true); setProgress(0);
    const timer = setTimeout(() => processAllLive(), autoTrigger ? 50 : 600);
    return () => clearTimeout(timer);
  }, [settings, images.length]);

  // Auto Save
  useEffect(() => {
    if (autoTrigger && !isProcessing && images.length > 0 && images.every(i => i.status === 'done')) {
        saveAllToDevice();
        setAutoTrigger(false);
    }
  }, [isProcessing, images, autoTrigger]);

  // Handlers
  const handleGalleryUpload = async () => {
    try {
      const result = await Camera.pickImages({ quality: 90, limit: 0 });
      const newImages = result.photos.map(p => ({
        id: Math.random().toString(36).substr(2, 9),
        preview: p.webPath, status: 'pending', processedUrl: null
      }));
      setImages(prev => [...prev, ...newImages]);
    } catch (e) { 
        // Fallback per Web
        if(fileInputRef.current) fileInputRef.current.click(); 
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
        const newImages = Array.from(e.target.files).map(f => ({
          id: Math.random().toString(36).substr(2, 9),
          preview: URL.createObjectURL(f), status: 'pending', processedUrl: null
        }));
        setImages(prev => [...prev, ...newImages]);
        e.target.value = '';
    }
  };

  const handleWatermarkImg = (e) => {
      const f = e.target.files[0];
      if (f) {
          const r = new FileReader();
          r.onload = (ev) => setSettings(s => ({ ...s, watermarkImage: ev.target.result, watermarkType: 'image', watermarkEnabled: true }));
          r.readAsDataURL(f);
      }
  };

  const handleAutoMagic = () => {
      setSettings(prev => ({ ...prev, aiEnhance: true, aiIntensity: 60, exposureEnabled: true, exposure: 10, contrastEnabled: true, contrast: 10, upscale: false }));
      setAutoTrigger(true);
  };

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));

  // --- LOGICA DI ELABORAZIONE IMMAGINE (CANVAS) ---
  const processAllLive = async () => {
    setIsProcessing(true); setProgress(10);
    const processed = [];
    for (let i = 0; i < images.length; i++) {
        try {
            const res = await processSingleImage(images[i]);
            processed.push({ ...images[i], processedUrl: res, status: 'done' });
        } catch (e) { processed.push({ ...images[i], status: 'error' }); }
        setProgress(((i + 1) / images.length) * 100);
    }
    setImages(processed); setIsProcessing(false);
  };

  const processSingleImage = (imgObj) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgObj.preview;
      img.crossOrigin = "Anonymous"; // Importante per il web
      img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let w = img.width, h = img.height;

            // Limite per performance
            const MAX = 3000;
            if (w > MAX || h > MAX) { const r = Math.min(MAX/w, MAX/h); w *= r; h *= r; }

            // Resize & Upscale
            if (settings.upscale) { w *= 2; h *= 2; }
            if (settings.resizeEnabled) {
                if (settings.resizeMode === 'percent') { w *= (settings.widthPercent/100); h *= (settings.widthPercent/100); }
                else {
                    const scale = Math.min((settings.targetWidthPx || w)/w, (settings.targetHeightPx || h)/h);
                    w *= scale; h *= scale;
                }
            }
            canvas.width = Math.round(w); canvas.height = Math.round(h);

            // Filtri
            let filter = '';
            let c=100, s=100, b=100;
            if (settings.aiEnhance) { const i = settings.aiIntensity/100; c+=20*i; s+=30*i; b+=5*i; }
            if (settings.exposureEnabled) b += (settings.exposure / 2);
            if (settings.contrastEnabled) c += settings.contrast;

            filter = `contrast(${c}%) saturate(${s}%) brightness(${b}%) `;
            if (settings.grayscale) filter += 'grayscale(100%) ';

            ctx.filter = filter;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';

            // Watermark
            if (settings.watermarkEnabled) {
                ctx.globalAlpha = settings.watermarkOpacity / 100;
                const drawContent = (x, y) => {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate((settings.watermarkRotation * Math.PI) / 180);

                    if (settings.watermarkType === 'text' && settings.watermarkText) {
                        const fs = Math.max(12, h * (settings.watermarkSize/100 || 0.03));
                        ctx.font = `bold ${fs}px ${settings.watermarkFont}`;
                        ctx.fillStyle = settings.watermarkColor;
                        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 4;
                        ctx.fillText(settings.watermarkText, 0, 0);
                    } else if (settings.watermarkType === 'image' && settings.watermarkImage) {
                         const wmImg = new Image(); wmImg.src = settings.watermarkImage;
                         const size = Math.max(50, w * (settings.watermarkSize/100));
                         ctx.drawImage(wmImg, -size/2, -size/2, size, size);
                    }
                    ctx.restore();
                };

                if (settings.watermarkTile) {
                    const stepX = w / 3; const stepY = h / 3;
                    for(let i=0; i<4; i++) for(let j=0; j<4; j++) drawContent((i*stepX) - stepX/2, (j*stepY) - stepY/2);
                } else {
                    let wx = w/2, wy = h/2;
                    const p = w * 0.05;
                    if(settings.watermarkPosition.includes('left')) wx = p;
                    else if(settings.watermarkPosition.includes('right')) wx = w - p;
                    if(settings.watermarkPosition.includes('top')) wy = p;
                    else if(settings.watermarkPosition.includes('bottom')) wy = h - p;
                    drawContent(wx, wy);
                }
                ctx.globalAlpha = 1.0;
            }
            resolve(canvas.toDataURL(settings.format, settings.quality));
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("Load Error"));
    });
  };

  const saveAllToDevice = async () => {
    let count = 0;
    for (const img of images) {
        if (img.status !== 'done') continue;
        try {
            const base64 = img.processedUrl.split(',')[1];
            const ext = settings.format.split('/')[1];
            const name = (settings.renameEnabled ? settings.prefix : 'Img_') + Date.now() + count + '.' + ext;
            await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Documents });
            count++;
        } catch (e) { console.error(e); }
    }
    await Toast.show({ text: `Saved ${count} images!`, duration: 'long' });
  };

  // --- RENDER ---
  return (
    <div style={s.container}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.logoBox}>
           <div style={s.logoIcon}><Zap size={16} color={colors.primary}/></div>
           <span style={{fontWeight:'bold', fontSize:'16px', color:'#fff'}}>Batch <span style={{color:colors.primary}}>ImgFlow</span></span>
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
             {images.length > 0 && (
                <button onClick={handleGalleryUpload} style={{border:`1px solid ${colors.border}`, background:colors.surface, color:colors.primary, borderRadius:'6px', padding:'4px 8px', fontSize:'10px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
                    <Plus size={12}/> ADD
                </button>
             )}
             <SegmentedToggle
               options={[{label:'QUICK', value:'quick'}, {label:'PRO', value:'pro'}]}
               value={appMode} onChange={setAppMode}
             />
             <button onClick={()=>setShowInfo(!showInfo)} style={{background:'none', border:'none', color:colors.textMuted, cursor:'pointer'}}><Info size={18}/></button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={s.main}>
        {images.length === 0 ? (
            <div onClick={handleGalleryUpload} style={{...s.emptyState, height:'200px', cursor:'pointer'}}>
                <Upload size={32} color={colors.primary}/>
                <div style={{textAlign:'center', color:colors.textMuted}}>
                    <p style={{color:'#fff', margin:0, fontSize:'14px'}}>Tap to load images</p>
                    <small style={{fontSize:'10px'}}>JPG, PNG, HEIC</small>
                </div>
            </div>
        ) : (
            <div style={s.grid}>
                {images.map(img => (
                    <div key={img.id} style={s.card}>
                        <img src={img.preview} style={s.imgFull} alt="raw" />
                        {img.status === 'done' && img.processedUrl && (
                            <div style={s.splitRight}>
                                <img src={img.processedUrl} style={s.imgSplit} alt="edit" />
                            </div>
                        )}
                        <div style={s.badgeContainer}>
                            <span style={s.badge(true)}>RAW</span>
                            {img.status === 'done' && <span style={s.badge(false)}>EDIT</span>}
                        </div>
                        <button onClick={(e)=>{e.stopPropagation(); removeImage(img.id)}} style={{position:'absolute', top:5, right:5, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', zIndex:20}}><X size={12}/></button>
                    </div>
                ))}
            </div>
        )}
        {appMode === 'pro' && (
            <div style={{marginTop:'40px', textAlign:'center', color:colors.textMuted, opacity:0.7}}>
                <Wand2 size={32} color={colors.accent} style={{margin:'0 auto 8px'}}/>
                <p style={{fontSize:'12px'}}>Pro Mode Active</p>
            </div>
        )}
      </div>

      {/* HIDDEN INPUTS */}
      <input type="file" ref={fileInputRef} onChange={handleFileInput} multiple style={{display:'none'}} />
      <input type="file" ref={watermarkInputRef} onChange={handleWatermarkImg} accept="image/*" style={{display:'none'}} />

      {/* FOOTER CONTROLS */}
      {images.length > 0 && appMode === 'quick' && (
        <div style={s.footer}>
            {isProcessing && <div style={{height:'2px', width:'100%', backgroundColor:colors.surface}}><div style={{height:'100%', width:`${progress}%`, backgroundColor:colors.primary, transition:'width 0.2s'}}></div></div>}
            
            <div style={s.tabBar}>
                {['enhance', 'resize', 'watermark', 'output'].map(tab => (
                    <button key={tab} onClick={()=>setActiveTab(tab)} style={s.tabBtn(activeTab===tab)}>
                        {tab==='enhance' && <Sliders size={18}/>}
                        {tab==='resize' && <Settings size={18}/>}
                        {tab==='watermark' && <Type size={18}/>}
                        {tab==='output' && <Download size={18}/>}
                        <span style={{fontSize:'8px', fontWeight:'bold', marginTop:'2px'}}>{tab.toUpperCase()}</span>
                    </button>
                ))}
            </div>

            <div style={s.controlArea}>
                {activeTab === 'enhance' && (
                    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                        <div style={s.row}>
                            <span style={s.label}><Zap size={10} style={{marginRight:4}}/> AI Auto Color</span>
                            <SegmentedToggle options={[{label:'OFF', value:false}, {label:'ON', value:true}]} value={settings.aiEnhance} onChange={v => setSettings({...settings, aiEnhance:v})} />
                        </div>
                        {settings.aiEnhance && <input type="range" value={settings.aiIntensity} onChange={e=>setSettings({...settings, aiIntensity:parseInt(e.target.value)})} style={s.range} />}
                        
                        <div style={s.row}>
                             <span style={s.label}>Exposure</span>
                             <SegmentedToggle options={[{label:'OFF', value:false}, {label:'ON', value:true}]} value={settings.exposureEnabled} onChange={v => setSettings({...settings, exposureEnabled:v})} />
                        </div>
                        {settings.exposureEnabled && <input type="range" min="-100" max="100" value={settings.exposure} onChange={e=>setSettings({...settings, exposure:parseInt(e.target.value)})} style={s.range} />}
                    </div>
                )}
                {/* Aggiungi qui gli altri TAB (Resize, Watermark, Output) con la stessa logica del tuo codice originale. Ho mantenuto 'enhance' come esempio. */}
                 {activeTab === 'resize' && (
                    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                        <div style={s.row}><span style={s.label}>Resize</span><SegmentedToggle options={[{label:'OFF', value:false}, {label:'ON', value:true}]} value={settings.resizeEnabled} onChange={v => setSettings({...settings, resizeEnabled:v})} /></div>
                        {settings.resizeEnabled && <input type="range" min="10" max="100" value={settings.widthPercent} onChange={e=>setSettings({...settings, widthPercent:parseInt(e.target.value)})} style={s.range} />}
                    </div>
                )}
                {activeTab === 'watermark' && (
                    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                         <div style={s.row}><span style={s.label}>Watermark</span><SegmentedToggle options={[{label:'OFF', value:false}, {label:'ON', value:true}]} value={settings.watermarkEnabled} onChange={v => setSettings({...settings, watermarkEnabled:v})} /></div>
                         {settings.watermarkEnabled && <input type="text" value={settings.watermarkText} onChange={e=>setSettings({...settings, watermarkText:e.target.value})} style={s.input} />}
                    </div>
                )}
                {activeTab === 'output' && (
                    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                         <div style={s.row}><span style={s.label}>Format</span><SegmentedToggle options={[{label:'JPG', value:'image/jpeg'}, {label:'PNG', value:'image/png'}]} value={settings.format} onChange={v => setSettings({...settings, format:v})} /></div>
                    </div>
                )}
            </div>

            <div style={s.actionRow}>
                <button onClick={()=>setImages([])} style={{...s.btn, width:'48px', background:colors.surface, color:colors.textMuted}}><RefreshCw size={18}/></button>
                <button onClick={handleAutoMagic} disabled={isProcessing} style={{...s.btn, width:'64px', background:'rgba(16,185,129,0.15)', border:`1px solid ${colors.primary}`, color:colors.primary, flexDirection:'column', gap:'0', padding:'0'}}><Wand2 size={16}/><span style={{fontSize:'8px', marginTop:'2px'}}>AUTO</span></button>
                <button onClick={saveAllToDevice} disabled={isProcessing} style={{...s.btn, flex:1, background:colors.white, color:colors.black, minWidth:'120px'}}>{isProcessing ? <Loader2 className="animate-spin"/> : <Download size={18}/>} <span style={{marginLeft:'4px'}}>SAVE ALL</span></button>
            </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={()=>setShowInfo(false)}>
             <div style={{background:colors.surface, padding:'24px', borderRadius:'16px', border:`1px solid ${colors.border}`, width:'80%', maxWidth:'300px', textAlign:'center'}} onClick={e=>e.stopPropagation()}>
                 <h3 style={{color:'#fff', margin:0}}>Batch ImgFlow Web</h3>
                 <p style={{color:colors.textMuted, fontSize:'12px', margin:'8px 0'}}>Web Simulation Mode</p>
                 <button onClick={()=>setShowInfo(false)} style={{background:'none', border:'none', color:colors.white, textDecoration:'underline', fontSize:'12px'}}>Close</button>
             </div>
        </div>
      )}
    </div>
  );
}