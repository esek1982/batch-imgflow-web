import streamlit as st

st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

st.markdown("""
<style>
    .block-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
    header, footer { visibility: hidden; }
    iframe { display: block; border: none; width: 100vw; height: 100vh; }
</style>
""", unsafe_allow_html=True)

# ⚠️ FONDAMENTALE: Aggiungi /?embedded=true alla fine dell'URL
# Se l'URL finisce già con una slash, non metterne due.
url_target = "https://batch-imgflow-web-c3ypebjb5spkccqjhoszmo.streamlit.app/"

html_code = f"""
<iframe 
    src="{url_target}" 
    allow="camera; microphone; clipboard-read; clipboard-write;"
    sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads"
    scrolling="no">
</iframe>
"""

st.markdown(html_code, unsafe_allow_html=True)