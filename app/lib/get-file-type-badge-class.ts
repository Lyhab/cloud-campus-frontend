export function getFileTypeBadgeClass(fileType: string): string {
  const type = fileType.toUpperCase();

  switch (type) {
    case "PDF":
      return "pdf-badge";
    case "PPTX":
      return "pptx-badge";
    case "DOCX":
      return "docx-badge";
    case "XLSX":
      return "xlsx-badge";
    case "CSV":
      return "csv-badge";
    default:
      return "txt-badge";
  }
}
