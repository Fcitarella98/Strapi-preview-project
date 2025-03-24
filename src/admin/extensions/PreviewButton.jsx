import React, { useEffect, useState, useRef } from "react";
import { Button } from "@strapi/design-system";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/strapi/admin";

const PreviewButtonForMessagge = () => {
  const contentManagerContext = useContentManagerContext();
  console.log("Content manager = ", contentManagerContext);
  if (!contentManagerContext || !contentManagerContext.form) {
    return null; // Evita errori se il form non è ancora pronto
  }
  const fetchAttempted = useRef(false);
  const { form, isCreatingEntry, status, layout, id } = contentManagerContext;
  console.log("id = ", id);
  console.log("form = ", form);
  const [entryId, setEntryId] = useState(id);
  const [previewUrl, setPreviewUrl] = useState("");

  // 🔹 Recupera l'ID una volta disponibile
  useEffect(() => {
    if (!isCreatingEntry && form?.initialValues?.nome) {
      console.log("✅ ID ottenuto:", id);
      setEntryId(id);
    }
  }, [form.initialData, isCreatingEntry]);

  useEffect(() => {
    // Reset del flag quando entryId cambia
    fetchAttempted.current = false;
  }, [id]);

  // 🔹 Ottieni l'URL di preview dinamicamente
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (entryId) {
        fetchAttempted.current = true;
        try {
          const response = await fetch(
            `http://localhost:1337/api/preview/message/${entryId}`
          );
          console.log("✅ Risposta API ricevuta:", response);
          const data = await response.json();
          console.log("✅ Data:", data);
          if (data?.url) {
            setPreviewUrl(`${data.url}`);
            console.log("url costruita", data.url);
          }
        } catch (error) {
          console.error("Errore nel recupero dell'URL di preview:", error);
        }
      }
    };

    fetchPreviewUrl();
  }, [id, JSON.stringify(form.initialValues)]);

  // 🔹 Pulsante di anteprima
  const handlePreview = () => {
    console.log("Entry id = ", entryId);
    if (!entryId) {
      alert("Salva il contenuto prima di visualizzare la preview.");
      return;
    }
    console.log("url costruita", previewUrl);
    window.open(`http://localhost:1337${previewUrl}`, "_blank");
  };

  return (
    <Button
      key={`preview-button-${entryId}`}
      variant="secondary"
      onClick={handlePreview}
      style={{ marginLeft: "10px", width: "100%" }}
      disabled={!previewUrl}
    >
      Anteprima
    </Button>
  );
};

const DataSegmentButton = ({ componentData }) => {
  const contentManagerContext = useContentManagerContext();
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Log per capire quando componentData cambia
  useEffect(() => {
    console.log("DataSegmentButton useEffect: componentData changed:", componentData);
    if (componentData && Object.keys(componentData).length > 0) {
      const sendData = async () => {
        setLoading(true);
        try {
          const response = await fetch("http://localhost:1337/api/total-segment", {
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
    }  else {
      console.warn("Metodo setFieldValue non disponibile nel form context");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    console.log("closeModal called");
    setShowModal(false);
  };

  return (
    <div>
      {/* Bottone per aprire la modale */}
      <Button
        variant="secondary"
        onClick={openModal}
        style={{ marginLeft: "10px", width: "100%" }}
        disabled={loading}
      >
        Anteprima
      </Button>
      {/* Modale */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: "black", fontSize: "16px" }}>Risultato</h3>
            {console.log("Render modale, apiResponse:", apiResponse)}
            <p style={{ color: "black", fontSize: "16px" }}>
              {apiResponse !== null ? apiResponse.toString() : "Nessun dato"}
            </p>
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

