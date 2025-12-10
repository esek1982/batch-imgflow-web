import streamlit as st
from PIL import Image
import io
import zipfile

# --- CONFIGURAZIONE PAGINA ---
st.set_page_config(page_title="Batch ImgFlow", layout="centered")

# Nascondiamo menu e footer di Streamlit per un look più pulito su WordPress
hide_streamlit_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            </style>
            """
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# --- TITOLO ---
st.title("Batch ImgFlow Web")
st.write("Carica le tue immagini per processarle in batch.")

# --- LA TUA FUNZIONE DI ELABORAZIONE ---
def elabora_immagine(image_file):
    img = Image.open(image_file)
    
    # -----------------------------------------------------------
    # QUI INSERISCI LA TUA LOGICA ATTUALE (es. resize, watermark)
    # Esempio semplice: convertiamo tutto in scala di grigi
    img = img.convert("L") 
    # -----------------------------------------------------------
    
    return img

# --- INTERFACCIA UPLOAD ---
uploaded_files = st.file_uploader("Trascina qui le immagini", accept_multiple_files=True, type=['png', 'jpg', 'jpeg', 'webp'])

if uploaded_files:
    if st.button(f"Processa {len(uploaded_files)} immagini"):
        
        # Creiamo un buffer per lo ZIP in memoria
        zip_buffer = io.BytesIO()
        
        progress_bar = st.progress(0)
        
        with zipfile.ZipFile(zip_buffer, "w") as zf:
            for i, uploaded_file in enumerate(uploaded_files):
                # 1. Elabora
                img_processed = elabora_immagine(uploaded_file)
                
                # 2. Salva l'immagine processata in memoria
                img_byte_arr = io.BytesIO()
                # Puoi cambiare il formato qui sotto (es. format='JPEG')
                img_processed.save(img_byte_arr, format='PNG') 
                
                # 3. Aggiungi allo ZIP
                filename = f"processed_{uploaded_file.name.split('.')[0]}.png"
                zf.writestr(filename, img_byte_arr.getvalue())
                
                # Aggiorna barra
                progress_bar.progress((i + 1) / len(uploaded_files))
        
        # Finalizza lo zip
        zip_buffer.seek(0)
        
        st.success("Elaborazione completata!")
        
        # --- BOTTONE DOWNLOAD ---
        st.download_button(
            label="SCARICA TUTTO (ZIP)",
            data=zip_buffer,
            file_name="batch_imgflow_result.zip",
            mime="application/zip"
        )