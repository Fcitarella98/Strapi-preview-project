import React, { useMemo, useEffect, useState, useRef } from "react";
import { Button } from "@strapi/design-system";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";
import LoadingIndicator from "./LoadingIndicator";
import "./styles.css";
import styled from 'styled-components';
import { LinkButton } from '@strapi/design-system';
import renderRichTextNodes from './renderRichTextNodes';
import DetectTranslateModal from './DetectTranslateModal';

const PreviewButtonForMessagge = () => {

  const LinkButtonStyled = styled(LinkButton)`
  width: 100%;

  // Fix visited state color for the icon.
  &:visited {
    color: ${({ theme }) => theme.colors.primary700};
  }
`;
  const contentManagerContext = useContentManagerContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle che apre la modale
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle che chiude la modale
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setContentData(null);
    setError(null);
  };

  console.log("Content manager = ", contentManagerContext);
  if (!contentManagerContext || !contentManagerContext.form) {
    return null; // Evita errori se il form non è ancora pronto
  }
  const { contentType } = useContentManagerContext();
  const { id } = useContentManagerContext();
  // In questo esempio assumiamo che il uid sia disponibile in una proprietà specifica.
  // Se non è presente, potresti doverlo estrarre da un'altra fonte o dal context della route.
  if (!id) {
    return null;
  }
  const uid = contentType.apiID;
  console.log("Modified data", contentType);

  const handleClick = async () => {
    if (!uid || !id) {
      console.error('UID o ID non disponibili');
      return;
    }
    // Costruisci l’URL con i parametri in query string
    const endpoint = ` http://localhost:3000/your-endpoint?uid=${uid}&documentId=${id}`;

    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        // Recupera il contenuto HTML dalla risposta
        const htmlContent = await response.text();
        // Apri una nuova finestra/scheda con target _blank
        // Definisci il meta tag per la viewport mobile
        const newWindow = window.open('', '_blank', 'width=375,height=667');
        if (newWindow) {
          newWindow.document.open();
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        } else {
          console.error('Impossibile aprire la nuova finestra');
        }
      } else {
        console.error('Errore nella chiamata', response.statusText);
      }
    } catch (error) {
      console.error('Errore durante il fetch:', error);
    }
  };
  // Funzione per rendere dinamicamente il contenuto di tipo "rich text"
  const renderRichText = (nodes) => {
    return nodes.map((node, index) => {
      // Se il nodo è un paragrafo (o un nodo semplice di testo)
      if (node.type === 'paragraph' || node.type === 'text') {
        return (
          <p key={index}>
            {node.children && node.children.map((child, i) => child.text).join(' ')}
          </p>
        );
      }
      // Se il nodo rappresenta un elenco puntato
      else if (node.type === 'bulleted-list') {
        return (
          <ul key={index}>
            {node.children &&
              node.children.map((child, i) => (
                <li key={i}>{child.text}</li>
              ))}
          </ul>
        );
      }
      // Se il nodo rappresenta un elenco numerato
      else if (node.type === 'numbered-list') {
        return (
          <ol key={index}>
            {node.children &&
              node.children.map((child, i) => (
                <li key={i}>{child.text}</li>
              ))}
          </ol>
        );
      }
      // Altri tipi: li mostriamo in un div come fallback
      else {
        return (
          <div key={index}>
            {node.children && node.children.map((child, i) => child.text).join(' ')}
          </div>
        );
      }
    });
  };

  const handleHelpClick = async () => {
    if (!uid) {
      setError('UID non disponibile per questo documento');
      return;
    }
    console.log("Valore di uid:", uid);
    setLoading(true);
    setError(null);

    // Costruisci l'endpoint filtrando per il campo uuid
    const endpoint = `http://localhost:1337/api/my-content-types?filters[Uid][$eq]=${uid}`;
    console.log("Chiamata a endpoint:", endpoint);

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setContentData(data);
      console.log("Collected Data", data);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError("Errore nel recupero dei dati");
    }
    setLoading(false);
  };

  const descriptionContent =
    contentData && contentData.data && contentData.data.length > 0
      ? renderRichTextNodes(contentData.data[0].descrizione)
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '1rem' }}>
      <LinkButtonStyled onClick={handleClick}>
        Anteprima
      </LinkButtonStyled>
      <Button onClick={handleHelpClick} variant="secondary">
        Help
      </Button>
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '4px',
              width: '80%',
              maxWidth: '500px',
              position: 'relative',
            }}
          >
            <h2 style={{ color: 'black' }}>Dettagli del Content Type</h2>
            {contentData && contentData.data && contentData.data.length > 0 ? (
              <div>
                <p style={{ color: 'black' }}>
                  <strong>UUID:</strong> {contentData.data[0].Uid}
                </p>
                <p style={{ color: 'black' }}>
                  <strong>Titolo:</strong> {contentData.data[0].Titolo}
                </p>
                <p style={{ color: 'black' }}>
                  <strong>Descrizione:</strong> {descriptionContent || 'Nessuna descrizione disponibile.'}
                </p>
              </div>
            ) : (
              <p style={{ color: 'red' }}>Nessun dato trovato per il UUID specificato.</p>
            )}
            {/* Pulsante per chiudere la modale */}
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <DetectTranslateModal />
    </div>
  );
};


const DataSegmentButton = ({ componentData }) => {

  const contentManagerContext = useContentManagerContext();
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Utilizza un selettore molto specifico per individuare il div problematico.
    const targetDiv = document.querySelector(
      ".sc-FEMpB.khlocw.sc-gjcoXW.cMVucY > div:nth-child(2)"
    );
    if (targetDiv) {
      // Imposta direttamente lo stile inline
      targetDiv.style.width = "100%";
      // Se serve, puoi anche rimuovere il margin-left applicato
      targetDiv.style.marginLeft = "0";
    }
  }, []);
  // Log per capire quando componentData cambia
  useEffect(() => {

    const domain = process.env.REACT_APP_API_DOMAIN || "http://localhost:1337";
    // Puoi definire una variabile specifica per questo endpoint oppure usare una stringa di default
    const endpoint = process.env.REACT_APP_TOTAL_SEGMENT_ENDPOINT || "/api/total-segment";
    console.log("DOMAIN :", domain);
    console.log("DataSegmentButton useEffect: componentData changed:", componentData);
    if (componentData && Object.keys(componentData).length > 0) {
      const sendData = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${domain}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(componentData),
          });
          const data = await response.json();
          console.log("Parsed API data:", data);
          // Assumi che il valore sia dentro data.result
          setApiResponse(data.count);
        } catch (error) {
          console.error("Errore nel contattare l'API:", error);
        } finally {
          setLoading(false);
        }
      };
      sendData();
    }
  }, [componentData]);

  const openModal = () => {
    console.log("openModal called, apiResponse:", apiResponse);
    setShowModal(true);
    if (apiResponse === null) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    // Aggiorna il campo "TotaleSegmenti" nel form
    if (
      contentManagerContext &&
      contentManagerContext.form &&
      typeof contentManagerContext.form.setValues === "function"
    ) {
      const newValues = {
        ...contentManagerContext.form.values,
        totale_segmenti: apiResponse,
      };
      console.log("Aggiornamento form values:", newValues);
      contentManagerContext.form.setValues(newValues);
    } else {
      console.warn("Metodo setFieldValue non disponibile nel form context");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    console.log("closeModal called");
    const newValues = {
      ...contentManagerContext.form.values,
      totale_segmenti: apiResponse,
    };
    console.log("Aggiornamento form values:", newValues);
    contentManagerContext.form.setValues(newValues);
    setShowModal(false);
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {/* Bottone per aprire la modale */}
      <Button
        variant="secondary"
        onClick={openModal}
        size="L"
        className="my-big-button"
      >
        Anteprima
      </Button>
      {/* Modale */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: "black", fontSize: "16px" }}>Risultato</h3>
            {loading || apiResponse === null ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  minHeight: "100px",
                }}
              >
                <LoadingIndicator></LoadingIndicator>
              </div>
            ) : (
              <p style={{ color: "black", fontSize: "16px" }}>
                {apiResponse.toString()}
              </p>
            )}
            <button onClick={closeModal}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

const PreviewButton = () => {
  const contentManagerContext = useContentManagerContext();
  console.log("PreviewButton: contentManagerContext:", contentManagerContext);
  if (!contentManagerContext || !contentManagerContext.form) {
    console.log("PreviewButton: Form not ready, returning null");
    return null;
  }
  const { slug } = contentManagerContext;
  console.log("PreviewButton: slug is", slug);

  // In base al content type, scegli il pulsante corretto
  const renderButton = () => {
    switch (slug) {
      case "api::segment.segment":
        console.log("Rendering DataSegmentButton for segment");
        return <DataSegmentButton componentData={contentManagerContext.form.initialValues} />;
      case "api::message.message":
        console.log("Rendering PreviewButtonForMessagge for message");
        return <PreviewButtonForMessagge />;
      default:
        console.log("No button to render for slug:", slug);
        return null;
    }
  };

  return <div style={{ marginLeft: "10px" }}>{renderButton()}</div>;
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "4px",
    minWidth: "300px",
    textAlign: "center",
  },
};

export default PreviewButton;

