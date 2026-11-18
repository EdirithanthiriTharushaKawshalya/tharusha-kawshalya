export const RESEARCH_PAPERS_BUCKET = "research-papers";
export const MAX_RESEARCH_PAPER_BYTES = 20 * 1024 * 1024;

export async function validateResearchPaper(file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    throw new Error("Please choose a PDF research paper.");
  }
  if (file.size === 0 || file.size > MAX_RESEARCH_PAPER_BYTES) {
    throw new Error("The research paper must be a non-empty PDF up to 20 MB.");
  }
  const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (header !== "%PDF-") {
    throw new Error("This file is not a valid PDF. Please choose a PDF research paper.");
  }
}
