import { fromString as htmlToText } from 'html-to-text';
import franc from 'franc';
import iso6393 from 'iso-639-3';

/**
 * Rileva la lingua di un frammento HTML o di testo semplice.
 * @param {string} html Conteuto HTML (o testo) da analizzare.
 * @returns { { code: string, name: string } } codice ISO639‑3 e nome della lingua.
 */
const detectLanguage = (html) => {
  // 1) Estrai plain text
  const text = htmlToText(html, { wordwrap: false, selectors: [] });
  // 2) Usa franc: restituisce ISO639‑3 (es. 'ita' per italiano)
  const iso3 = franc(text, { minLength: 10 });
  // 3) Trova la descrizione umana
  const entry = iso6393.find(l => l.iso6393 === iso3);
  return {
    code: iso3 === 'und' ? 'unknown' : iso3,
    name: entry ? entry.name : 'Unknown',
  };
};
