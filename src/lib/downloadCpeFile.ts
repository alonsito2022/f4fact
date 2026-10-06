import { toast } from "react-toastify";

export function downloadCpeFile(
  url: string,
  filename: string,
  driveKind?: "firma" | "cdr",
  operationId?: number,
) {
  const useDrive = Boolean(driveKind && operationId);
  if (!filename || (!useDrive && !url)) {
    toast.error("URL o nombre de archivo no válido");
    return;
  }

  const downloadUrl = useDrive
    ? `${process.env.NEXT_PUBLIC_BASE_API}/operations/drive_file/${operationId}/${driveKind}/`
    : url.toString().replace("http:", "https:");

  if (useDrive) {
    console.log("[Drive] consultando archivo", {
      operationId,
      driveKind,
      downloadUrl,
    });
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  console.log("[XML/CDR] descarga por URL local", { downloadUrl });

  fetch(downloadUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta de la descarga");
      }
      return response.blob();
    })
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      console.error("Error al descargar el archivo:", error);
      toast.error("No se pudo descargar el archivo");
    });
}
