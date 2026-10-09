import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSamplePdf } from '../src/lib/sample-pdf.js';
test('PDF entry accepts a PDF signature with case-insensitive extension', async()=>{
  await validateSamplePdf(new File(['%PDF-1.7\n'], 'Report.PDF', {type:'application/pdf'}));
});
test('PDF entry rejects renamed text, wrong extensions, empty and oversized files', async()=>{
  await assert.rejects(validateSamplePdf(new File(['ordinary text'],'report.pdf')), /not a valid PDF/);
  await assert.rejects(validateSamplePdf(new File(['%PDF-1.7'],'report.txt')), /Choose a PDF file/);
  await assert.rejects(validateSamplePdf(new File([],'empty.pdf')), /smaller than 10 MB/);
  await assert.rejects(validateSamplePdf({name:'large.pdf',size:10*1024*1024+1}), /smaller than 10 MB/);
});
