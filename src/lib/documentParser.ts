import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return extractTextFromDOCX(file);
  } else if (fileName.endsWith('.txt')) {
    return file.text();
  }
  
  throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
}

export function isValidResumeFile(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  
  return validTypes.includes(file.type) || validExtensions.some(ext => fileName.endsWith(ext));
}

export function getFileIcon(fileName: string): string {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf')) return '📄';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return '📝';
  if (name.endsWith('.txt')) return '📃';
  return '📎';
}
