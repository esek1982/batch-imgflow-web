import streamlit as st
import streamlit.components.v1 as components

# 1. Configurazione pagina
st.set_page_config(layout="wide", initial_sidebar_state="collapsed", page_title="Batch ImgFlow")

# 2. Rendi l'HTML dell'App React come una stringa
#    Usiamo CDN per caricare React e Babel (per compilare il JSX al volo)
react_app_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batch ImgFlow Web</title>
    
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        body { margin: 0; padding: 0; background-color: #09090b; color: #e4e4e7; font-family: sans-serif; overflow: hidden; }
        /* Nascondi scrollbar */
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
        
        /* Stili Custom per simulare i componenti Lucide (che non possiamo importare senza npm) */
        .icon-mock { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-style: normal; font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>

    <div id="root"></div>

    <script type="text/babel">
        const { useState, useRef, useEffect } = React;

        // --- MOCK DELLE ICONE LUCIDE (Per far funzionare l'app senza build system) ---
        // Sostituiamo le importazioni reali con componenti semplici
        const IconWrapper = ({ children, color, size }) => (
            <span style={{color: color || 'currentColor', fontSize: size || 16, display:'inline-block', textAlign:'center'}}>
                {children}
            </span>
        );
        
        const Zap = (p) => <IconWrapper {...p}>⚡</IconWrapper>;
        const Settings = (p) => <IconWrapper {...p}>⚙️</IconWrapper>;
        const Upload = (p) => <IconWrapper {...p}>⬆️</IconWrapper>;
        const RefreshCw = (p) => <IconWrapper {...p}>🔄</IconWrapper>;
        const Type = (p) => <IconWrapper {...p}>T</IconWrapper>;
        const Download = (p) => <IconWrapper {...p}>⬇️</IconWrapper>;
        const Plus = (p) => <IconWrapper {...p}>➕</IconWrapper>;
        const X = (p) => <IconWrapper {...p}>❌</IconWrapper>;
        const Info = (p) => <IconWrapper {...p}>ℹ️</IconWrapper>;
        const Sliders = (p) => <IconWrapper {...p}>🎚️</IconWrapper>;
        const Wand2 = (p) => <IconWrapper {...p}>🪄</IconWrapper>;
        const Loader2 = (p) => <IconWrapper {...p}>⏳</IconWrapper>;
        const Grid = (p) => <IconWrapper {...p}>▦</IconWrapper>;
        const RotateCw = (p) => <IconWrapper {...p}>↻</IconWrapper>;
        
        // Mock Capacitor Libraries
        const Camera = { pickImages: async () => { throw new Error("Web fallback"); } };
        const Filesystem = { writeFile: async () => console.log("Salvataggio simulato web") };
        const Preferences = { get: async () => ({ value: null }) };
        const Toast = { show: async ({ text }) => alert(text) };

        // --- STILI CSS-IN-JS (Dal tuo file originale) ---
        const colors = {
            bg: '#09090b', surface: '#18181b', border: '#27272a',
            text: '#e4e4e7', textMuted: '#71717a',
            primary: '#10b981', accent: '#8b5cf6', white: '#ffffff', black: '#000000'
        };

        const s = {
            container: { 
                display: 'flex', flexDirection: 'column', height: '100vh', 
                backgroundColor: colors.bg, color: colors.text, 
                maxWidth: '500px', margin: '0 auto', position: 'relative',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)', borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`
            },
            header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surface, zIndex: 50 },
            logoBox: { display: 'flex', alignItems: 'center', gap: '8px' },
            logoIcon: { width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg },
            main: { flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: '200px' },
            grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' },
            card: { position: 'relative', aspectRatio: '4/5', backgroundColor: colors.surface, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.border}` },
            imgFull: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
            splitRight: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.3)', zIndex: 10 },
            imgSplit: { position: 'absolute', top: 0, left: '-100%', width: '200%', height: '100%', maxWidth: 'none', objectFit: 'cover' },
            badgeContainer: { position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 20 },
            badge: (isRaw) => ({ fontSize: '8px', fontWeight: 'bold', color: isRaw ? 'rgba(255,255,255,0.6)' : colors.primary, backgroundColor: 'rgba(0,0,0,0.7)', padding: '2px 4px', borderRadius: '4px' }),
            emptyState: { marginTop: '40px', border: `2px dashed ${colors.border}`, borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(39,39,42,0.2)' },
            footer: { 
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: '500px', backgroundColor: colors.bg, 
                borderTop: `1px solid ${colors.border}`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px', 
                paddingBottom: '20px', zIndex: 40, boxShadow: '0 -10px 40px rgba(0,0,0,0.8)' 
            },
            tabBar: { display: 'flex', justifyContent: 'space-around', padding: '8px 0', borderBottom: `1px solid ${colors.border}` },
            tabBtn: (isActive) => ({ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: isActive ? colors.primary : colors.textMuted, fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }),
            controlArea: { padding: '16px', height: '160px', overflowY: 'auto' },
            actionRow: { display: 'flex', gap: '8px', padding: '12px 16px', backgroundColor: colors.bg },
            toggleContainer: { display: 'flex', backgroundColor: colors.surface, borderRadius: '8px', padding: '3px', border: `1px solid ${colors.border}`, width: 'fit-content' },
            toggleBtn: (isActive) => ({ border: 'none', background: isActive ? colors.primary : 'transparent', color: isActive ? colors.black : colors.textMuted, borderRadius: '6px', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }),
            label: { fontSize: '10px', color: colors.textMuted, marginBottom: '4px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' },
            input: { width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.surface, color: colors.text, fontSize: '12px', outline: 'none' },
            row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
            range: { width: '100%', accentColor: colors.primary, height: '4px', cursor: 'pointer', marginTop: '4px' },
            posGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', width: '60px', height: '60px', backgroundColor: colors.surface, padding: '2px', borderRadius: '6px', border: `1px solid ${colors.border}` },
            posCell: (active) => ({ backgroundColor: active ? colors.primary : colors.bg, border: 'none', borderRadius: '2px', cursor: 'pointer' }),
            btn: { border: 'none', borderRadius: '12px', padding: '0 16px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' },
        };

        const SegmentedToggle = ({ options, value, onChange }) => (
            <div style={s.toggleContainer}>
                {options.map(opt => (
                <button key={opt.value} onClick={() => onChange(opt.value)} style={s.toggleBtn(value === opt.value)}>
                    {opt.label}
                </button>
                ))}
            </div>
        );

        function App() {
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

            // Handlers
            const handleGalleryUpload = async () => {
                if(fileInputRef.current) fileInputRef.current.click();
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
            
            const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));
            
            // --- CORE LOGIC (Process) ---
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
                img.crossOrigin = "Anonymous"; 
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        let w = img.width, h = img.height;
                        const MAX = 3000;
                        if (w > MAX || h > MAX) { const r = Math.min(MAX/w, MAX/h); w *= r; h *= r; }
                        
                        // Filters (Simplified for this demo)
                        canvas.width = Math.round(w); canvas.height = Math.round(h);
                        let c=100, s=100, b=100;
                        if (settings.aiEnhance) { const i = settings.aiIntensity/100; c+=20*i; s+=30*i; b+=5*i; }
                        ctx.filter = `contrast(${c}%) saturate(${s}%) brightness(${b}%)`;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        ctx.filter = 'none';
                        
                        // Watermark Demo
                        if (settings.watermarkEnabled && settings.watermarkText) {
                             ctx.font = `bold ${h*0.05}px sans-serif`;
                             ctx.fillStyle = "white";
                             ctx.textAlign = "center";
                             ctx.fillText(settings.watermarkText, w/2, h/2);
                        }

                        resolve(canvas.toDataURL(settings.format, settings.quality));
                    } catch (e) { reject(e); }
                };
                img.onerror = () => reject(new Error("Load Error"));
                });
            };
            
            // Effects
            useEffect(() => {
                if (images.length > 0 && autoTrigger) {
                    const timer = setTimeout(() => processAllLive(), 500);
                    return () => clearTimeout(timer);
                }
            }, [settings, images.length, autoTrigger]);


            return (
                <div style={s.container}>
                     {/* HEADER */}
                    <div style={s.header}>
                        <div style={s.logoBox}>
                            <div style={s.logoIcon}><Zap size={16} color={colors.primary}/></div>
                            <span style={{fontWeight:'bold', fontSize:'16px', color:'#fff'}}>Batch <span style={{color:colors.primary}}>ImgFlow</span></span>
                        </div>
                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                            {images.length > 0 && <button onClick={handleGalleryUpload} style={{border:`1px solid ${colors.border}`, background:colors.surface, color:colors.primary, borderRadius:'6px', padding:'4px 8px', fontSize:'10px', fontWeight:'bold', cursor:'pointer'}}>+ ADD</button>}
                            <SegmentedToggle options={[{label:'QUICK', value:'quick'}, {label:'PRO', value:'pro'}]} value={appMode} onChange={setAppMode} />
                        </div>
                    </div>

                    {/* MAIN */}
                    <div style={s.main}>
                        {images.length === 0 ? (
                            <div onClick={handleGalleryUpload} style={{...s.emptyState, cursor:'pointer'}}>
                                <Upload size={32} color={colors.primary}/>
                                <div style={{textAlign:'center', color:colors.textMuted}}>
                                    <p style={{color:'#fff', margin:0}}>Tap to load images</p>
                                </div>
                            </div>
                        ) : (
                            <div style={s.grid}>
                                {images.map(img => (
                                    <div key={img.id} style={s.card}>
                                        <img src={img.preview} style={s.imgFull} />
                                        {img.status === 'done' && <div style={s.splitRight}><img src={img.processedUrl} style={s.imgSplit} /></div>}
                                        <button onClick={(e)=>{e.stopPropagation(); removeImage(img.id)}} style={{position:'absolute', top:5, right:5, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', borderRadius:'50%', width:20, height:20}}>X</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileInput} multiple style={{display:'none'}} />

                    {/* FOOTER */}
                    {images.length > 0 && (
                        <div style={s.footer}>
                            {isProcessing && <div style={{height:'2px', width:`${progress}%`, backgroundColor:colors.primary}}></div>}
                            <div style={s.tabBar}>
                                <button onClick={()=>setActiveTab('enhance')} style={s.tabBtn(activeTab==='enhance')}><Sliders size={18}/><span>EDIT</span></button>
                                <button onClick={()=>setActiveTab('watermark')} style={s.tabBtn(activeTab==='watermark')}><Type size={18}/><span>TEXT</span></button>
                            </div>
                            
                            <div style={s.controlArea}>
                                {activeTab === 'enhance' && (
                                    <div style={{display:'flex', flexDirection:'column', gap:'12'}}>
                                        <div style={s.row}><span style={s.label}>AI Auto Color</span><SegmentedToggle options={[{label:'OFF', value:false},{label:'ON', value:true}]} value={settings.aiEnhance} onChange={v=>setSettings({...settings, aiEnhance:v})}/></div>
                                    </div>
                                )}
                                {activeTab === 'watermark' && (
                                    <div style={{display:'flex', flexDirection:'column', gap:'12'}}>
                                         <div style={s.row}><span style={s.label}>Watermark</span><SegmentedToggle options={[{label:'OFF', value:false},{label:'ON', value:true}]} value={settings.watermarkEnabled} onChange={v=>setSettings({...settings, watermarkEnabled:v})}/></div>
                                         {settings.watermarkEnabled && <input type="text" value={settings.watermarkText} onChange={e=>setSettings({...settings, watermarkText:e.target.value})} style={s.input} />}
                                    </div>
                                )}
                            </div>
                            
                            <div style={s.actionRow}>
                                <button onClick={()=>processAllLive()} style={{...s.btn, flex:1, background:colors.white, color:colors.black}}>
                                    {isProcessing ? <Loader2/> : <Download size={18}/>} SAVE ALL
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
"""

# 3. Renderizza il codice HTML/React direttamente (senza Iframe esterno)
st.markdown("""
<style>
    .block-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
    header, footer { display: none !important; }
    iframe { border: none; display: block; }
</style>
""", unsafe_allow_html=True)

components.html(react_app_html, height=850, scrolling=False)