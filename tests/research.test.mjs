import assert from "node:assert/strict";
import test from "node:test";
import { validateResearchPaper, MAX_RESEARCH_PAPER_BYTES } from "../src/lib/research.ts";

test("accepts a PDF with an uppercase extension and no reported MIME type", async () => {
  await validateResearchPaper(new File(["%PDF-1.7\n"], "paper.PDF"));
});

test("rejects unsupported file types, empty files, and renamed non-PDF files", async () => {
  for (const file of [
    new File(["%PDF-1.7"], "paper.txt"),
    new File(["%PDF-1.7"], "paper.pdf", { type: "text/plain" }),
    new File([], "paper.pdf", { type: "application/pdf" }),
    new File(["not a PDF"], "paper.pdf", { type: "application/pdf" }),
  ]) {
    await assert.rejects(() => validateResearchPaper(file));
  }
});

test("accepts the size limit and rejects files one byte over it", async () => {
  const content = new Uint8Array(MAX_RESEARCH_PAPER_BYTES);
  content.set(new TextEncoder().encode("%PDF-1.7\n"));
  await validateResearchPaper(new File([content], "paper.pdf", { type: "application/pdf" }));
  await assert.rejects(
    () => validateResearchPaper(new File([content, "x"], "paper.pdf", { type: "application/pdf" })),
    /up to 20 MB/,
  );
});
