
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import './App.css';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Paragraph, Packer } from 'docx';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();


const tools = [
  'JPG to PDF',
  'Merge PDF',
  'Split PDF',
  'Compress PDF',
  'Edit PDF',
  'PDF to Word',
  'PDF to PowerPoint',
  'PDF to Excel',
  'PDF to JPG',
  'Word to PDF',
  'PowerPoint to PDF',
  'Excel to PDF',
  'Rotate PDF',
  'Protect PDF',
  'Unlock PDF',
  'Repair PDF',
  'Crop PDF',
];




function ProfileBoard() {
  return (
    <div className="profile-board">
      <div className="board-cables">
        <div className="cable cable-left"></div>
        <div className="cable cable-right"></div>
      </div>

      <div className="crane-hook">
        <div className="hook-block">///</div>
        <div className="hook-shape">
  <span></span>
</div>
      </div>

      <div className="profile-sign">
        <div className="sign-inner">
          <div className="profile-info">
            <h2>PRATHAM SINGH</h2>
            <div className="profile-underline"></div>
            <h3>B.Tech CSE | AI &amp; ML</h3>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="profile-link"
            >
              <span className="contact-icon">in</span>
              <span>LinkedIn: www.linkedin.com/in/pratham-singh-18d

</span>
            </a>

            <a href="mailto:your-email@gmail.com" className="profile-link">
              <span className="contact-icon">✉</span>
              <span>Email: prathamsingh18d@gmail.com</span>
            </a>
          </div>




<div className="photo-placeholder">
  <img
    className="pratham-photo"
    src="/pratham.jpeg"
    alt="Pratham Singh"
  />
</div>


        </div>
      </div>
    </div>
  );
}







function App() {
  const [activeTool, setActiveTool] = useState('JPG to PDF');
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [splitPages, setSplitPages] = useState('1,3,5-7');

  // Add files selected or dropped by the user
  function addFiles(newFiles) {

  const allowedTypes = {
  'JPG to PDF': ['image/jpeg', 'image/png'],

  'Merge PDF': ['application/pdf'],
  'Split PDF': ['application/pdf'],
  'Compress PDF': ['application/pdf'],
  'Edit PDF': ['application/pdf'],
  'PDF to Word': ['application/pdf'],
  'PDF to PowerPoint': ['application/pdf'],
  'PDF to Excel': ['application/pdf'],
  'PDF to JPG': ['application/pdf'],

  'Word to PDF': [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  'PowerPoint to PDF': [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],

  'Excel to PDF': [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  'Rotate PDF': ['application/pdf'],
  'Protect PDF': ['application/pdf'],
  'Unlock PDF': ['application/pdf'],
  'Repair PDF': ['application/pdf'],
  'Crop PDF': ['application/pdf'],
};


    const validTypes = allowedTypes[activeTool] || [];
    const validFiles = newFiles.filter((file) =>
      validTypes.includes(file.type)
    );

    setFiles((currentFiles) => [...currentFiles, ...validFiles]);

    if (validFiles.length !== newFiles.length) {
      setMessage(
        activeTool === 'JPG to PDF'
          ? 'Please select JPG or PNG images.'
          : 'Please select PDF files for this tool.'
      );
    } else {
      setMessage('');
    }
  }

  // Handle Browse button
  function handleFileChange(event) {
    addFiles(Array.from(event.target.files || []));
    event.target.value = '';
  }

  // Handle drag and drop
  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files || []));
  }

  // Change tool without leaving the page
  function selectTool(tool) {
    setActiveTool(tool);
    setFiles([]);
    setMessage('');
  }

  // Remove one selected file
  function removeFile(indexToRemove) {
    setFiles((currentFiles) =>
      currentFiles.filter((file, index) => index !== indexToRemove)
    );
    setMessage('');
  }

  // JPG to PDF conversion
  async function convertToPDF() {
    if (files.length === 0) {
      setMessage('Please select at least one image.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();

        const image =
          file.type === 'image/png'
            ? await pdf.embedPng(bytes)
            : await pdf.embedJpg(bytes);

        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const page = pdf.addPage([pageWidth, pageHeight]);

        const scale = Math.min(
          (pageWidth - 40) / image.width,
          (pageHeight - 40) / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        page.drawImage(image, {
          x: (pageWidth - width) / 2,
          y: (pageHeight - height) / 2,
          width,
          height,
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'converted-images.pdf';
      link.click();

      URL.revokeObjectURL(url);
      setMessage('PDF created and downloaded successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Conversion failed. Please try another image.');
    } finally {
      setLoading(false);
    }
  }


  // Merge multiple PDF files into one PDF
  async function mergePDF() {
    if (files.length < 2) {
      setMessage('Please select at least 2 PDF files to merge.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create a new, empty PDF
      const mergedPDF = await PDFDocument.create();

      // Read each selected PDF in order
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();

        // Open the current PDF
        const currentPDF = await PDFDocument.load(fileBytes);

        // Get all its pages
        const pageIndexes = currentPDF.getPageIndices();

        // Copy those pages into our new PDF
        const copiedPages = await mergedPDF.copyPages(
          currentPDF,
          pageIndexes
        );

        // Add the copied pages to the final PDF
        for (const page of copiedPages) {
          mergedPDF.addPage(page);
        }
      }

      // Save the finished PDF
      const pdfBytes = await mergedPDF.save();

      const blob = new Blob([pdfBytes], {
        type: 'application/pdf',
      });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Release the temporary download URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage('PDFs merged successfully!');
    } catch (error) {
      console.error(error);
      setMessage(
        'Could not merge these PDFs. Check that they are valid and not password-protected.'
      );
    } finally {
      setLoading(false);
    }
  }

  // split pdf logic


  // Extract selected pages from a PDF
  async function splitPDF() {
    if (files.length === 0) {
      setMessage('Please upload a PDF first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Open the first uploaded PDF
      const fileBytes = await files[0].arrayBuffer();
      const originalPDF = await PDFDocument.load(fileBytes);

      const totalPages = originalPDF.getPageCount();

      // Read input such as 1,3,5-7
      const parts = splitPages.split(',');
      const pageNumbers = [];

      for (const part of parts) {
        const value = part.trim();

        if (!value) {
          throw new Error('Please enter valid page numbers.');
        }

        if (value.includes('-')) {
          const range = value.split('-');

          if (
            range.length !== 2 ||
            !/^\d+$/.test(range[0].trim()) ||
            !/^\d+$/.test(range[1].trim())
          ) {
            throw new Error('Enter ranges like 2-5.');
          }

          const start = Number(range[0].trim());
          const end = Number(range[1].trim());

          if (
            start < 1 ||
            end > totalPages ||
            start > end
          ) {
            throw new Error(
              `Page ranges must be between 1 and ${totalPages}.`
            );
          }

          for (let page = start; page <= end; page++) {
            pageNumbers.push(page);
          }
        } else {
          if (!/^\d+$/.test(value)) {
            throw new Error('Enter page numbers like 1,3,5.');
          }

          const page = Number(value);

          if (page < 1 || page > totalPages) {
            throw new Error(
              `Enter page numbers between 1 and ${totalPages}.`
            );
          }

          pageNumbers.push(page);
        }
      }

      // Remove duplicate page numbers
      const uniquePages = [...new Set(pageNumbers)];

      // Create a new PDF
      const newPDF = await PDFDocument.create();

      // PDF page indexes start at 0, but users count from 1
      const indexes = uniquePages.map((page) => page - 1);

      const copiedPages = await newPDF.copyPages(
        originalPDF,
        indexes
      );

      for (const page of copiedPages) {
        newPDF.addPage(page);
      }

      // Generate the new PDF
      const pdfBytes = await newPDF.save();

      const blob = new Blob([pdfBytes], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'split-pages.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage(
        `Success! Extracted ${uniquePages.length} page(s) from ${totalPages} pages.`
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Could not split this PDF.');
    } finally {
      setLoading(false);
    }
  }



//  compress pdf logic

  // Basic PDF optimization
  async function compressPDF() {
    if (files.length === 0) {
      setMessage('Please upload a PDF first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Use the first uploaded PDF
      const file = files[0];
      const originalSize = file.size;
      const fileBytes = await file.arrayBuffer();

      // Open the PDF
      const pdf = await PDFDocument.load(fileBytes);

      // Save it using PDF object streams
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
      });

      const blob = new Blob([compressedBytes], {
        type: 'application/pdf',
      });

      const newSize = blob.size;
      const savedBytes = originalSize - newSize;
      const savedPercent = (
        (savedBytes / originalSize) * 100
      ).toFixed(1);

      // Download the processed PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'compressed.pdf';

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if (savedBytes > 0) {
        setMessage(
          `PDF processed! Original: ${(originalSize / 1024).toFixed(1)} KB. New size: ${(newSize / 1024).toFixed(1)} KB. Size reduced by ${savedPercent}%.`
        );
      } else if (savedBytes === 0) {
        setMessage(
          `PDF processed. The file size remains ${(newSize / 1024).toFixed(1)} KB. More advanced compression may be needed.`
        );
      } else {
        setMessage(
          `PDF processed, but its size increased from ${(originalSize / 1024).toFixed(1)} KB to ${(newSize / 1024).toFixed(1)} KB. Advanced compression may be needed.`
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        'Could not process this PDF. It may be damaged or password-protected.'
      );
    } finally {
      setLoading(false);
    }
  }



  // pdf to word

  
  // Convert PDF text into a Word document
  async function pdfToWord() {
    if (files.length === 0) {
      setMessage('Please upload a PDF first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Read the uploaded PDF
      const fileBytes = await files[0].arrayBuffer();

      // Open the PDF with PDF.js
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(fileBytes),
      }).promise;

      // Store the extracted text as Word paragraphs
      const wordParagraphs = [];

      // Read each PDF page
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        // Get the text from the current page
        const pageText = textContent.items
          .filter((item) => 'str' in item)
          .map((item) => item.str)
          .join(' ');

        // Add a heading for each page
        wordParagraphs.push(
          new Paragraph({
            text: `Page ${pageNumber}`,
            heading: 'Heading2',
          })
        );

        // Add the extracted text
        wordParagraphs.push(
          new Paragraph({
            text: pageText || '[No selectable text found on this page]',
          })
        );
      }

      // Create a Word document
      const wordDocument = new Document({
        sections: [
          {
            children: wordParagraphs,
          },
        ],
      });

      // Generate the .docx file
      const wordBlob = await Packer.toBlob(wordDocument);

      // Download the Word document
      const url = URL.createObjectURL(wordBlob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'converted-document.docx';

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage(
        `Success! Converted ${pdf.numPages} PDF page(s) into a Word document.`
      );
    } catch (error) {
      console.error(error);
      setMessage(
        'Conversion failed. Try a readable PDF that is not password-protected.'
      );
    } finally {
      setLoading(false);
    }
  }




  // pdf to jpg logic


  // Convert every PDF page into a JPG image
  async function pdfToJPG() {
    if (files.length === 0) {
      setMessage('Please upload a PDF first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Read the uploaded PDF
      const fileBytes = await files[0].arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(fileBytes),
      }).promise;

      // Create a ZIP file for all the JPG images
      const zip = new JSZip();

      // Convert each PDF page into a JPG
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setMessage(
          `Converting page ${pageNumber} of ${pdf.numPages}...`
        );

        const page = await pdf.getPage(pageNumber);

        // Scale 2 improves image clarity
        const viewport = page.getViewport({ scale: 2 });

        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not create the image canvas.');
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        // Draw the PDF page onto the canvas
        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        // Turn the canvas into a JPG image
        const imageBlob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Could not create JPG image.'));
              }
            },
            'image/jpeg',
            0.92
          );
        });

        // Add this page's image to the ZIP
        zip.file(`page-${pageNumber}.jpg`, imageBlob);

        // Release canvas memory
        canvas.width = 0;
        canvas.height = 0;
      }

      // Generate the ZIP download
      setMessage('Preparing your JPG images...');

      const zipBlob = await zip.generateAsync({
        type: 'blob',
      });

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'pdf-images.zip';

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage(
        `Success! Converted ${pdf.numPages} pages into JPG images.`
      );
    } catch (error) {
      console.error('PDF to JPG error:', error);

      setMessage(
        'Conversion failed. Please check that your PDF is valid and not password-protected.'
      );
    } finally {
      setLoading(false);
    }
  }














  // Run the selected tool





function handleProcess() {
  if (activeTool === 'JPG to PDF') {
    convertToPDF();
  } else if (activeTool === 'Merge PDF') {
    mergePDF();
  } else if (activeTool === 'Split PDF') {
    splitPDF();
  } else if (activeTool === 'Compress PDF') {
    compressPDF();
  } else if (activeTool === 'PDF to Word') {
    pdfToWord();
  } else if (activeTool === 'PDF to JPG') {
    pdfToJPG();
  } else {
    setMessage(
      `${activeTool} is selected. We will build its working logic next.`
    );
  }
}





  return (
    <div className="app">
      <header className="navbar">
        <a
          className="logo"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            selectTool('JPG to PDF');
          }}
        >
          PDF CONVERTER
        </a>

        <span className="nav-title">All PDF Tools</span>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <h3>PDF TOOLS</h3>

          {tools.map((tool) => (
            <button
              key={tool}
              className={`sidebar-button ${
                activeTool === tool ? 'active' : ''
              }`}
              onClick={() => selectTool(tool)}
            >
              {tool}
            </button>
          ))}
        </aside>

        <main className="workspace">
          <h1>{activeTool}</h1>

          <p className="subtitle">
            {activeTool === 'JPG to PDF'
              ? 'Convert your images into a PDF.'
              : `Select files to get started with ${activeTool}.`}
          </p>

          <div
            className={`upload-box ${dragging ? 'dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setDragging(false);
              }
            }}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">⬆</div>

              <h2>DRAG &amp; DROP FILES HERE</h2>
              <p>OR CLICK TO BROWSE</p>

              <span>
                {activeTool === 'JPG to PDF'
                  ? 'JPG, PNG · Max 50 MB per file'
                  : 'PDF files · Select one or more files'}
              </span>

              <label className="browse-button">
                Browse files
                <input
                  type="file"

accept={
  activeTool === 'JPG to PDF'
    ? 'image/jpeg,image/png'
    : activeTool === 'Word to PDF'
      ? '.doc,.docx'
      : activeTool === 'PowerPoint to PDF'
        ? '.ppt,.pptx'
        : activeTool === 'Excel to PDF'
          ? '.xls,.xlsx'
          : 'application/pdf'
}

                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          
{activeTool === 'Split PDF' && (
  <div className="split-options">
    <label htmlFor="split-pages">
      Pages to extract
    </label>

    <input
      id="split-pages"
      type="text"
      value={splitPages}
      onChange={(event) => setSplitPages(event.target.value)}
      placeholder="Example: 1,3,5-7"
    />

    <p>Enter page numbers separated by commas or ranges.</p>
  </div>
)}


          {files.length > 0 && (
            <section className="selected-files">
              <h3>Selected files ({files.length})</h3>

              {files.map((file, index) => (
                <div
                  className="file-row"
                  key={`${file.name}-${index}`}
                >
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => removeFile(index)}
                    disabled={loading}
                  >
                    Remove ✕
                  </button>
                </div>
              ))}
            </section>
          )}

          <button
            className="process-button"
            onClick={handleProcess}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : activeTool === 'JPG to PDF'
                ? 'Convert to PDF'
                : activeTool}
          </button>

          {message && (
            <p className="status-message" role="status">
              {message}
            </p>
          )}
          <ProfileBoard />
        </main>
      </div>
      
    </div>
  );
}

export default App;
