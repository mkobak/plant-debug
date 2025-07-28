import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DiagnosisResponse } from '../types';

/**
 * Final improved PDF generation - fixes font stretching, images, and page breaks
 */
export const generatePDF = async (diagnosis: DiagnosisResponse, files: File[]) => {
  try {
    // Find the DiagnosisResult component in the DOM
    const resultContainer = document.querySelector('[class*="resultContainer"]') as HTMLElement;
    
    if (!resultContainer) {
      throw new Error('Could not find the diagnosis result component to convert to PDF');
    }

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width in CSS
    tempContainer.style.minHeight = '297mm'; // A4 height for proper scaling
    tempContainer.style.padding = '15mm'; // A4-friendly padding
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.fontFamily = 'Arial, Helvetica, sans-serif';
    tempContainer.style.fontSize = '28px';
    tempContainer.style.lineHeight = '1.4';
    tempContainer.style.color = '#000000';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.overflow = 'visible'; // Allow content to overflow if needed

    // Clone content
    const clonedContent = resultContainer.cloneNode(true) as HTMLElement;
    clonedContent.removeAttribute('class');
    clonedContent.style.cssText = '';
    
    // Add header with logo, app name, and report title
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 20px 0;
      padding: 10px 0;
      border-bottom: 2px solid;
      page-break-after: avoid;
    `;

    // Logo (make it optional in case it doesn't load)
    const logo = document.createElement('img');
    logo.src = `${window.location.origin}/logo.png`; // Use absolute URL
    logo.style.cssText = `
      width: 80px;
      height: 80px;
      margin-right: 20px;
      object-fit: contain;
      display: block;
    `;
    
    // Handle logo load error gracefully
    logo.onerror = () => {
      logo.style.display = 'none';
      logo.style.width = '0';
      logo.style.marginRight = '0';
    };

    // App name and title container
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    `;

    // App name
    const appName = document.createElement('h1');
    appName.textContent = 'Plant Debugger';
    appName.style.cssText = `
      font-size: 30px;
      color: #000000;
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: bold;
    `;

    // Report title
    const reportTitle = document.createElement('h2');
    reportTitle.textContent = 'Debugging Report';
    reportTitle.style.cssText = `
      font-size: 25px;
      color: #000000;
      margin: 4px 0 0 0;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: normal;
      padding-bottom: 5px;
      width: 100%;
    `;

    // Assemble header
    titleContainer.appendChild(appName);
    titleContainer.appendChild(reportTitle);
    headerContainer.appendChild(logo);
    headerContainer.appendChild(titleContainer);

    tempContainer.appendChild(headerContainer);
    tempContainer.appendChild(clonedContent);

    // Style all elements with proper page break handling
    const allElements = tempContainer.querySelectorAll('*');
    allElements.forEach((element: Element) => {
      const el = element as HTMLElement;
      
      // Skip styling header elements to preserve their custom styling
      if (el.closest('.header-section') || el === headerContainer || headerContainer.contains(el)) {
        return;
      }
      
      el.style.fontFamily = 'Arial, Helvetica, sans-serif';
      el.style.color = '#000000';
      
      if (el.tagName === 'H1') {
        el.style.fontSize = '28px';
        el.style.fontWeight = 'bold';
        el.style.margin = '8px 0 6px 0';
        el.style.pageBreakAfter = 'avoid';
      } else if (el.tagName === 'H2') {
        el.style.fontSize = '25px'; 
        el.style.fontWeight = 'bold';
        el.style.margin = '12px 0 6px 0';
        el.style.pageBreakAfter = 'avoid';
      } else if (el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6') {
        el.style.fontSize = '25px';
        el.style.fontWeight = 'bold';
        el.style.margin = '20px 0 6px 0';
        el.style.borderBottom = '1px solid #ddd';
        el.style.paddingBottom = '3px';
        el.style.pageBreakBefore = 'auto';
        el.style.pageBreakAfter = 'avoid';
        el.style.pageBreakInside = 'avoid';
      } else if (el.tagName === 'P') {
        el.style.fontSize = '22px'; 
        el.style.lineHeight = '1.4';
        el.style.margin = '6px 0';
        el.style.pageBreakInside = 'avoid';
      } else if (el.tagName === 'LI') {
        el.style.fontSize = '22px';
        el.style.lineHeight = '1.4';
        el.style.margin = '4px 0';
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        el.style.margin = '8px 0 18px 0';
        el.style.paddingLeft = '18px';
        el.style.pageBreakInside = 'avoid';
      }
      
      // Section containers - keep together
      if (el.className && el.className.includes('section')) {
        el.style.pageBreakInside = 'avoid';
        el.style.marginBottom = '25px'; // More space between sections
        el.style.breakInside = 'avoid'; // CSS3 property
      }
      
      // Summary sections
      if (el.className && el.className.includes('summary')) {
        el.style.pageBreakInside = 'avoid';
        el.style.breakInside = 'avoid';
      }
      
      // Confidence badges
      if (el.className && el.className.includes('confidence')) {
        el.style.color = '#ffffff';
        el.style.fontWeight = 'bold';
        el.style.pageBreakInside = 'avoid';
      }
    });

    // Add specific styling for primary diagnosis and plant identification headers
    const primaryHeaders = tempContainer.querySelectorAll('.headerTitle, [class*="headerTitle"]');
    primaryHeaders.forEach((header: Element) => {
      const el = header as HTMLElement;
      console.log('Found primary header by class:', el.className, el.textContent?.substring(0, 50));
      
      el.style.setProperty('font-size', '28px', 'important');
      el.style.setProperty('font-weight', 'bold', 'important');
      el.style.setProperty('border-bottom', '1px solid #ddd', 'important');
      el.style.setProperty('padding-bottom', '3px', 'important');
      el.style.setProperty('margin', '20px 0 6px 0', 'important');
      el.style.setProperty('color', '#000000', 'important');
    });

    // Add specific styling for secondary diagnosis headers to ensure they get proper underline
    // This must be done AFTER the main styling loop to override H3 styles
    
    // Method 1: Target by CSS classes
    const secondaryHeaders = tempContainer.querySelectorAll('.secondaryHeaderTitle, [class*="secondaryHeaderTitle"], h3.secondaryHeaderTitle, [class*="secondaryDiagnosisHeader"] h3');
    secondaryHeaders.forEach((header: Element) => {
      const el = header as HTMLElement;
      console.log('Found secondary header by class:', el.className, el.textContent?.substring(0, 50));
      
      el.style.setProperty('font-size', '28px', 'important');
      el.style.setProperty('font-weight', 'bold', 'important');
      el.style.setProperty('border-bottom', '1px solid #ddd', 'important');
      el.style.setProperty('padding-bottom', '3px', 'important');
      el.style.setProperty('margin', '20px 0 6px 0', 'important');
      el.style.setProperty('color', '#000000', 'important');
    });

    // Method 2: Find any H3 that contains "Secondary Diagnosis" text
    const allH3s = tempContainer.querySelectorAll('h3');
    allH3s.forEach((h3: Element) => {
      const el = h3 as HTMLElement;
      if (el.textContent?.toLowerCase().includes('secondary diagnosis')) {
        console.log('Found H3 with secondary diagnosis text:', el.textContent?.substring(0, 50));
        
        el.style.setProperty('font-size', '28px', 'important');
        el.style.setProperty('font-weight', 'bold', 'important');
        el.style.setProperty('border-bottom', '1px solid #ddd', 'important');
        el.style.setProperty('padding-bottom', '3px', 'important');
        el.style.setProperty('margin', '20px 0 6px 0', 'important');
        el.style.setProperty('color', '#000000', 'important');
      }
      // Also check for primary diagnosis and plant identified titles
      if (el.textContent?.toLowerCase().includes('primary diagnosis') || 
          el.textContent?.toLowerCase().includes('plant identified')) {
        console.log('Found H3 with primary/plant title text:', el.textContent?.substring(0, 50));
        
        el.style.setProperty('font-size', '28px', 'important');
        el.style.setProperty('font-weight', 'bold', 'important');
        el.style.setProperty('border-bottom', '1px solid #ddd', 'important');
        el.style.setProperty('padding-bottom', '3px', 'important');
        el.style.setProperty('margin', '20px 0 6px 0', 'important');
        el.style.setProperty('color', '#000000', 'important');
      }
      // Also check for summary titles to make them larger
      if (el.textContent?.toLowerCase().trim() === 'summary') {
        console.log('Found H3 with summary title text:', el.textContent?.substring(0, 50));
        
        el.style.setProperty('font-size', '28px', 'important');
        el.style.setProperty('font-weight', 'bold', 'important');
        el.style.setProperty('padding-bottom', '3px', 'important');
        el.style.setProperty('color', '#000000', 'important');
      }
    });

    // Method 3: Find elements with specific attribute patterns that Next.js CSS modules might create
    const allElements2 = tempContainer.querySelectorAll('*');
    allElements2.forEach((element: Element) => {
      const el = element as HTMLElement;
      // Check if any of the element's classes contain "secondaryHeaderTitle" or similar patterns
      if (el.className && (
        el.className.includes('secondaryHeaderTitle') || 
        el.className.includes('secondary-header-title') ||
        el.className.includes('secondaryDiagnosisHeader')
      )) {
        console.log('Found element with secondary class pattern:', el.className, el.tagName, el.textContent?.substring(0, 50));
        
        if (el.tagName === 'H3' || el.textContent?.toLowerCase().includes('secondary diagnosis')) {
          el.style.setProperty('font-size', '28px', 'important');
          el.style.setProperty('font-weight', 'bold', 'important');
          el.style.setProperty('border-bottom', '1px solid #ddd', 'important');
          el.style.setProperty('padding-bottom', '3px', 'important');
          el.style.setProperty('margin', '20px 0 6px 0', 'important');
          el.style.setProperty('color', '#000000', 'important');
        }
      }
    });

    // Handle images - maintain aspect ratio, align left, allow side-by-side
    const images = tempContainer.querySelectorAll('img');
    
    // Filter out header logo from the images array to get proper indexing
    const contentImages = Array.from(images).filter(img => 
      img !== logo && !headerContainer.contains(img)
    );
    
    contentImages.forEach((img: HTMLImageElement, index: number) => {
      // Calculate size for up to 3 images side by side
      const availableWidth = 180; // mm (usable width after padding)
      const imageSpacing = 4; // mm spacing between images (reduced for better fit)
      const maxWidth = (availableWidth - 2 * imageSpacing) / 3; // About 57mm per image
      const maxHeight = 50; // mm maximum height
      
      img.style.maxWidth = `${maxWidth}mm`;
      img.style.maxHeight = `${maxHeight}mm`;
      img.style.width = 'auto'; // Let it scale naturally
      img.style.height = 'auto'; // Maintain aspect ratio
      img.style.objectFit = 'contain'; // Don't crop, maintain aspect ratio
      img.style.objectPosition = 'center';
      img.style.border = 'none';
      img.style.outline = 'none';
      img.style.borderRadius = '0px';
      img.style.display = 'inline-block'; // Allow side-by-side layout
      img.style.verticalAlign = 'top'; // Align tops of images
      img.style.pageBreakInside = 'avoid';
      img.style.background = 'none';
      img.style.backgroundColor = 'transparent';
      img.style.boxShadow = 'none';
      img.style.padding = '0';
      
      // Set consistent spacing: right margin for all except last in row
      const positionInRow = (index % 3) + 1; // 1, 2, or 3
      if (positionInRow === 3 || index === contentImages.length - 1) {
        // Last image in row or last image overall - no right margin
        img.style.margin = '10px 0 10px 0';
      } else {
        // First or second image in row - add right margin
        img.style.margin = `10px ${imageSpacing}mm 10px 0`;
      }
      
      // Ensure the image container doesn't interfere
      const imgParent = img.parentElement;
      if (imgParent) {
        imgParent.style.width = 'auto';
        imgParent.style.height = 'auto';
        imgParent.style.maxWidth = 'none';
        imgParent.style.overflow = 'visible';
        imgParent.style.textAlign = 'left'; // Align images to the left
        imgParent.style.background = 'none';
        imgParent.style.backgroundColor = 'transparent';
        imgParent.style.border = 'none';
        imgParent.style.outline = 'none';
        imgParent.style.boxShadow = 'none';
        imgParent.style.padding = '0';
        imgParent.style.margin = '0';
        imgParent.style.display = 'block'; // Ensure proper block flow
      }
      
      // Also check grandparent and other ancestors for border/background removal
      let ancestor = imgParent?.parentElement;
      while (ancestor && ancestor !== tempContainer) {
        ancestor.style.background = 'none';
        ancestor.style.backgroundColor = 'transparent';
        ancestor.style.border = 'none';
        ancestor.style.outline = 'none';
        ancestor.style.boxShadow = 'none';
        ancestor = ancestor.parentElement;
      }
    });

    // Helper function to create subsections within a large section
    const createSubsections = (parentElement: HTMLElement): HTMLElement[] => {
      const subsections: HTMLElement[] = [];
      let currentSubsection: HTMLElement | null = null;
      let currentSubsectionHeight = 0;
      const maxSubsectionHeight = 150; // Rough height limit for subsections (in DOM pixels)
      
      const children = Array.from(parentElement.children) as HTMLElement[];
      
      children.forEach((child) => {
        const childHeight = child.getBoundingClientRect().height;
        
        // If no current subsection or this child would make subsection too tall, start new one
        if (!currentSubsection || (currentSubsectionHeight + childHeight > maxSubsectionHeight && currentSubsectionHeight > 0)) {
          if (currentSubsection) {
            subsections.push(currentSubsection);
          }
          
          currentSubsection = document.createElement('div');
          currentSubsection.className = 'pdf-subsection';
          currentSubsection.style.breakInside = 'avoid';
          currentSubsection.style.pageBreakInside = 'avoid';
          currentSubsection.style.marginBottom = '10px';
          currentSubsectionHeight = 0;
        }
        
        // Move child to current subsection
        currentSubsection.appendChild(child);
        currentSubsectionHeight += childHeight;
      });
      
      // Add the last subsection
      if (currentSubsection && currentSubsection.children.length > 0) {
        subsections.push(currentSubsection);
      }
      
      return subsections;
    };

    // Group each main diagnosis section (summary, prevention, etc.) into a container for page break control
    // First, wrap the header in a PDF section
    const headerSection = document.createElement('div');
    headerSection.className = 'pdf-section header-section';
    headerSection.style.breakInside = 'avoid';
    headerSection.style.pageBreakInside = 'avoid';
    headerSection.style.marginBottom = '18px';
    
    // Move header into the section
    tempContainer.removeChild(headerContainer);
    headerSection.appendChild(headerContainer);
    tempContainer.insertBefore(headerSection, clonedContent);
    
    // Find all direct children of the clonedContent (should be sections or divs)
    const mainSections = Array.from(clonedContent.children);
    mainSections.forEach((child) => {
      if (
        child instanceof HTMLElement &&
        !child.classList.contains('pdf-section') &&
        child.parentNode
      ) {
        // Check if this child contains "Secondary Diagnosis" to force page break
        const containsSecondaryDiagnosis = child.textContent?.toLowerCase().includes('secondary diagnosis') ||
                                          child.className?.toLowerCase().includes('secondarydiagnosisheader') ||
                                          child.querySelector('.secondaryDiagnosisHeader, [class*="secondaryDiagnosisHeader"], .secondaryHeaderTitle, [class*="secondaryHeaderTitle"]') !== null;
        
        // Wrap each main section in a PDF section container
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'pdf-section';
        sectionDiv.style.breakInside = 'avoid';
        sectionDiv.style.pageBreakInside = 'avoid';
        sectionDiv.style.marginBottom = '18px';
        
        // If this section contains secondary diagnosis, force it to start on a new page
        if (containsSecondaryDiagnosis) {
          sectionDiv.style.pageBreakBefore = 'always';
        }
        
        child.parentNode.insertBefore(sectionDiv, child);
        sectionDiv.appendChild(child);
      }
    });

    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for images
    const imageElements = tempContainer.querySelectorAll('img');
    await Promise.all(Array.from(imageElements).map(img => {
      return new Promise<void>((resolve) => {
        if ((img as HTMLImageElement).complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });
    }));

    // Capture with higher scale for better text quality
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 3, // Higher scale for sharper text
      useCORS: true,
      allowTaint: true,
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
      logging: false,
      imageTimeout: 10000,
      removeContainer: false, // Do not remove yet
      foreignObjectRendering: false
    });

    // Create PDF with exact dimensions - no scaling/squishing
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    // Calculate natural dimensions based on DPI without forcing page width
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Convert canvas pixels to PDF millimeters at proper resolution
    // Since we used scale: 3, we need to scale back down for natural sizing
    const targetDPI = 96; // Standard web DPI
    const mmPerInch = 25.4;
    const pxToMm = mmPerInch / (targetDPI * 3); // Account for the 3x scale
    
    // Calculate natural dimensions without forcing aspect ratio changes
    // Use natural DPI-based conversion for both width and height - NO stretching/squishing at all
    const scalingFactor = 0.9; // Scale down to 90% to provide better margins
    const naturalWidth = canvasWidth * pxToMm * scalingFactor;
    const naturalHeight = canvasHeight * pxToMm * scalingFactor;

    // Smart section-based pagination: accumulate whole sections per page, never split a section
    // Include both pdf-section and pdf-subsection elements
    const allSectionDivs = Array.from(tempContainer.querySelectorAll('.pdf-section, .pdf-subsection')) as HTMLElement[];
    // Calculate scale factor between DOM and canvas
    const domTotalHeight = tempContainer.scrollHeight;
    const canvasTotalHeight = canvas.height;
    const scaleFactor = canvasTotalHeight / domTotalHeight;
    let sectionPositions: { top: number, bottom: number, height: number, forceNewPage: boolean }[] = [];
    
    // Use getBoundingClientRect for more accurate position and height
    const containerRect = tempContainer.getBoundingClientRect();
    
    allSectionDivs.forEach(div => {
      const rect = div.getBoundingClientRect();
      const top = (rect.top - containerRect.top) * scaleFactor;
      const height = rect.height * scaleFactor;
      const bottom = top + height;
      const forceNewPage = div.style.pageBreakBefore === 'always';
      sectionPositions.push({ top, bottom, height, forceNewPage });
    });

    // Calculate max page height in canvas pixels using consistent DPI-based scaling
    const canvasToMmRatio = pxToMm * scalingFactor; // Apply scaling factor consistently
    // Since we're scaling content down, we need more conservative page height to prevent overflow
    const maxPageHeightPx = (maxHeight * scalingFactor) / canvasToMmRatio; // Use 90% of max height for safety margin
    let pageStart = 0;
    const EPSILON = 10; // Increased epsilon for better safety margin
    
    while (pageStart < sectionPositions.length) {
      let pageHeight = 0;
      let pageEnd = pageStart;
      
      // Accumulate sections for this page, never split a section
      while (pageEnd < sectionPositions.length) {
        const section = sectionPositions[pageEnd];
        const sectionHeight = section.height;
        
        // If this section is marked to force a new page and we already have content on this page,
        // force it to start on a new page
        if (section.forceNewPage && pageHeight > 0) {
          break;
        }
        
        // If this is the first section and it's too tall for a page, force it alone
        if (pageHeight === 0 && sectionHeight > maxPageHeightPx + EPSILON) {
          pageEnd++;
          break;
        }
        
        // If adding this section would exceed page height, stop here
        // Use more conservative calculation to prevent overflow
        if (pageHeight + sectionHeight > maxPageHeightPx - EPSILON) {
          break;
        }
        
        pageHeight += sectionHeight;
        pageEnd++;
      }
      
      // Ensure we process at least one section per page
      if (pageEnd === pageStart) {
        pageEnd = pageStart + 1;
      }
      
      // Render this page (from first section's top to last section's bottom)
      const pageTop = sectionPositions[pageStart].top;
      const pageBottom = sectionPositions[pageEnd - 1].bottom;
      const pageContentHeight = pageBottom - pageTop;
      
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d')!;
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageContentHeight;
      
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0, pageTop,
        canvas.width, pageContentHeight,
        0, 0,
        canvas.width, pageContentHeight
      );
      
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      
      // Calculate natural page height using consistent DPI-based scaling - NO STRETCHING
      const pageNaturalHeight = pageContentHeight * canvasToMmRatio;
      
      if (pageStart > 0) pdf.addPage();
      
      // Add image with natural dimensions - maintain aspect ratio always
      // Position at margin, let content overflow page boundaries if needed rather than stretch
      pdf.addImage(pageImgData, 'PNG', margin, margin, naturalWidth, pageNaturalHeight);
      
      pageStart = pageEnd;
    }

    // Now remove temp container
    document.body.removeChild(tempContainer);

    // Save the PDF
    const plantName = diagnosis.plant.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const fileName = `plant-diagnosis-${plantName}-${date}.pdf`;
    
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating final PDF:', error);
    throw error;
  }
};
