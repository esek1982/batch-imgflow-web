import streamlit as st

# 1. Configurazione pagina: Layout "wide" e sidebar chiusa
st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

# 2. CSS per rimuovere i margini di default di Streamlit
st.markdown("""
<style>
    /* Rimuove padding e margini dal blocco principale */
    .block-container {
        padding: 0rem !important;
        margin: 0rem !important;
        max-width: 100% !important;
    }
    /* Rimuove header e footer di default di Streamlit se visibili */
    header {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Assicura che l'iframe non abbia bordi */
    iframe {
        display: block;
        border: none;
        width: 100vw;
        height: 100vh;
    }
</style>
""", unsafe_allow_html=True)

# 3. URL dell'applicazione
# ⚠️ IMPORTANTE: Sostituisci questo URL con il link della TUA app.
# Assicurati che finisca con /?embedded=true per evitare l'errore dei redirect.
# Nota lo slash "/" finale prima di "?embedded=true"
url_target = "https://batch-imgflow-web-c3ypebjb5spkccqjhoszmo.streamlit.app/?embedded=true"
# 4. Renderizza l'iframe in HTML puro
html_code = f"""
<iframe 
    src="{url_target}" 
    allow="camera; microphone; clipboard-read; clipboard-write;"
    scrolling="no">
</iframe>
"""

st.markdown(html_code, unsafe_allow_html=True)