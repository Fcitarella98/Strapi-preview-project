// File: src/plugins/your-plugin/admin/src/components/supportedLocales.js

// Elenco statico delle lingue supportate senza usare il plugin i18n



// File: src/plugins/your-plugin/admin/src/components/DetectTranslateModal.js

import React, { useState, useEffect } from 'react';
import { Button } from '@strapi/design-system';
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import { htmlToText } from 'html-to-text';
import { franc } from 'franc';
import { iso6393 } from 'iso-639-3';
import { SUPPORTED_LOCALES } from './supportedLocales';

/**
 * Componente che rileva automaticamente la lingua del campo di testo
 * e apre una modale basata su una lista statica di lingue (senza plugin i18n).
 */
const DetectTranslateModal = () => {
  const { form } = useContentManagerContext();
  const id = useContentManagerContext();
  const { contentType }= useContentManagerContext();
  const { uid } = contentType;
  const { initialValues, values, onChange } = form;
  const [isOpen, setIsOpen] = useState(false);
  const [detected, setDetected] = useState({ code: null, name: null });
  const [selectedLocale, setSelectedLocale] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const locales = SUPPORTED_LOCALES;
  const openModal = () => {
    setError(null);
    setHasConfirmed(false);
    // se vuoi ripartire dal rilevamento:
    setSelectedLocale(detected.code);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);
  // Rileva la lingua all'avvio e ad ogni cambio di initialData
  useEffect(() => {
    const html = initialValues?.Descrizione ?? initialValues?.Nome ?? '';
    console.log("Html:", html);
    if (html) {
      const text = htmlToText(html, { wordwrap: false, selectors: [] });
      const iso3 = franc(text);
      const entry = iso6393.find(lang => lang.iso6393 === iso3);
      setDetected({
        code: iso3 === 'und' ? 'unknown' : entry?.iso6391 || iso3,
        name: entry ? entry.name : 'Unknown',
      });
    }
  }, [form]);

  const handleConfirm = async () => {
    if (!id || !selectedLocale || selectedLocale === detected.code) {
      return;
    }

    setIsConfirming(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        id,
        uid,
        sourceLang: detected.code,
        targetLang: selectedLocale,
      });
      console.log("params", params);
      const response = await fetch('http://localhost:3000/your-endpoint?${params.toString()}');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setHasConfirmed(true);
    } catch (err) {
      console.error('Translation request failed:', err);
      setError('Si è verificato un errore durante l’invio. Riprova.');
    } finally {
      setIsConfirming(false);
    }
  };
  return (
    //
    <>
      <Button onClick={openModal} variant="secondary" style={{ marginTop: 16 }}>
        Traduci {detected.name && `(${detected.name})`}
      </Button>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/** Step 1: selezione lingua */}
            {!hasConfirmed ? (
              <>
                <h2>Traduzione</h2>
                <p>
                  <strong>Lingua corrente:</strong>{' '}
                  {detected.name} ({detected.code})
                </p>

                <label htmlFor="locale-select">Seleziona lingua:</label>
                <select
                  id="locale-select"
                  value={selectedLocale}
                  onChange={e => setSelectedLocale(e.target.value)}
                  style={styles.select}
                >
                  {SUPPORTED_LOCALES
                    .filter(loc => loc.code !== detected.code)
                    .map(loc => (
                      <option key={loc.code} value={loc.code}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                </select>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={styles.buttons}>
                  <Button onClick={closeModal} variant="tertiary" disabled={isConfirming}>
                    Annulla
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isConfirming || !selectedLocale}
                  >
                    {isConfirming ? 'Invio…' : 'Conferma'}
                  </Button>
                </div>
              </>
            ) : (
              /** Step 2: messaggio di avviso */
              <>
                <h2>Traduzione in corso</h2>
                <p>
                  Perfetto! Verrà creato un secondo Content Type tradotto in{' '}
                  <strong>{selectedLocale}</strong>.
                </p>
                <div style={styles.buttons}>
                  <Button onClick={closeModal}>Chiudi</Button>
                </div>
              </>
            )}

            {/** bottone X sempre visibile */}
            <button onClick={closeModal} style={styles.closeBtn} disabled={isConfirming}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DetectTranslateModal;

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 20,
    borderRadius: 4,
    width: '90%', maxWidth: 500,
    position: 'relative',
  },
  select: {
    width: '100%', padding: 8,
    margin: '8px 0 16px', fontSize: '1rem',
    color: '#000', backgroundColor: '#fff',
  },
  buttons: {
    display: 'flex', justifyContent: 'flex-end', gap: 8,
  },
  closeBtn: {
    position: 'absolute', top: 10, right: 10,
    background: 'transparent', border: 'none',
    fontSize: 24, cursor: 'pointer',
  },
};