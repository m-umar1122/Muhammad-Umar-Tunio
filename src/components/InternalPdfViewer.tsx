import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  MoveHorizontal,
  FileText,
  AlertTriangle,
  Loader2,
  BookOpenCheck,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentPageContent } from '../utils/examoraLogic';

// Configure PDF.js worker if needed when rendering uploaded raw PDF binaries
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
} catch {
  // Fallback to structured academic canvas sheets
}

export interface ViewerTarget {
  collection: 'notes' | 'pdfs' | 'past-papers';
  id: string;
  title: string;
}

interface InternalPdfViewerProps {
  target: ViewerTarget | null;
  onClose: () => void;
  adminToken?: string | null;
}

interface LoadedDocumentData {
  id: string;
  title: string;
  subtitle: string;
  pageCount: number;
  pages: DocumentPageContent[];
  hasUploadedPdfBinary: boolean;
  pdfStreamUrl: string;
}

export const InternalPdfViewer: React.FC<InternalPdfViewerProps> = ({
  target,
  onClose,
  adminToken,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docData, setDocData] = useState<LoadedDocumentData | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [fitToWidth, setFitToWidth] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [renderedCanvases, setRenderedCanvases] = useState<string[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;

    async function fetchDoc() {
      setLoading(true);
      setError(null);
      setDocData(null);
      setRenderedCanvases([]);
      setCurrentPage(1);
      setScrollProgress(0);

      try {
        const headers: Record<string, string> = {};
        if (adminToken) {
          headers.Authorization = `Bearer ${adminToken}`;
        }

        const res = await fetch(
          `/api/documents/${target!.collection}/${target!.id}/content`,
          { headers }
        );
        const body = await res.json();

        if (!res.ok) {
          throw new Error(
            body.error || 'Unable to load this study document in the internal viewer.'
          );
        }

        if (cancelled) return;
        setDocData(body as LoadedDocumentData);

        // If an uploaded binary PDF exists, attempt to render its pages with PDF.js onto data URLs
        if (body.hasUploadedPdfBinary && body.pdfStreamUrl) {
          try {
            const pdfRes = await fetch(body.pdfStreamUrl, { headers });
            if (pdfRes.ok) {
              const arrayBuf = await pdfRes.arrayBuffer();
              const loadingTask = pdfjsLib.getDocument({ data: arrayBuf });
              const pdfDoc = await loadingTask.promise;
              const numPages = pdfDoc.numPages;
              const dataUrls: string[] = [];

              for (let p = 1; p <= numPages; p++) {
                const page = await pdfDoc.getPage(p);
                const viewport = page.getViewport({ scale: 1.6 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                if (ctx) {
                  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                  dataUrls.push(canvas.toDataURL('image/png'));
                }
              }
              if (!cancelled && dataUrls.length > 0) {
                setRenderedCanvases(dataUrls);
              }
            }
          } catch {
            // Gracefully fall back to structured multi-page academic sheet view
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to open document in internal viewer.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDoc();
    return () => {
      cancelled = true;
    };
  }, [target, adminToken]);

  const totalPages =
    renderedCanvases.length > 0
      ? renderedCanvases.length
      : docData?.pages?.length || 1;

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const pct = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
    setScrollProgress(scrollHeight <= clientHeight + 8 ? 100 : pct);

    // Determine which page is most visible near top of reader viewport
    const containerRect = container.getBoundingClientRect();
    const thresholdY = containerRect.top + containerRect.height * 0.35;

    let activePage = 1;
    for (let i = 0; i < pageRefs.current.length; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= thresholdY) {
        activePage = i + 1;
      }
    }
    setCurrentPage(activePage);
  }, []);

  useEffect(() => {
    handleScroll();
  }, [docData, zoom, fitToWidth, handleScroll]);

  if (!target) return null;

  const handleZoomIn = () => {
    setFitToWidth(false);
    setZoom((z) => Math.min(175, z + 15));
  };

  const handleZoomOut = () => {
    setFitToWidth(false);
    setZoom((z) => Math.max(65, z - 15));
  };

  const handleResetZoom = () => {
    setFitToWidth(false);
    setZoom(100);
  };

  const handleToggleFitWidth = () => {
    setFitToWidth((prev) => !prev);
  };

  const toggleFullScreen = () => {
    setIsExpanded((prev) => !prev);
  };

  const effectiveWidthStyle: React.CSSProperties = fitToWidth
    ? { width: '100%', maxWidth: '100%' }
    : { width: `${Math.round(794 * (zoom / 100))}px`, maxWidth: '100%' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Internal PDF Viewer — ${target.title}`}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-50 flex flex-col bg-[#0F172A] text-white select-none ${
        isExpanded ? 'p-0' : 'p-0 sm:p-3 md:p-5'
      }`}
    >
      <div
        className={`flex flex-col flex-1 w-full mx-auto overflow-hidden bg-[#1E293B] border border-white/15 shadow-2xl ${
          isExpanded ? 'max-w-none rounded-none' : 'max-w-6xl sm:rounded-2xl'
        }`}
      >
        {/* Top Control Toolbar */}
        <div className="bg-[#091D49] border-b border-white/15 px-3 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back Button + Document Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#123675] hover:bg-[#EAB52F] text-white hover:text-[#091D49] text-xs sm:text-sm font-bold transition-colors border border-white/15 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#EAB52F]">
                  EXAMORA Internal PDF Reader
                </span>
              </div>
              <h2 className="font-serif-heading text-sm sm:text-base font-bold text-white truncate">
                {docData?.title || target.title}
              </h2>
            </div>
          </div>

          {/* Right: Reader Zoom, Fit-to-Width, Page Count & Fullscreen Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <div className="flex items-center bg-[#123675]/80 border border-white/15 rounded-xl p-1">
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom out"
                title="Zoom Out"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono-num font-semibold text-[#EAB52F]">
                {fitToWidth ? 'FIT' : `${zoom}%`}
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                title="Zoom In"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
                title="Reset Zoom (100%)"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleFitWidth}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                fitToWidth
                  ? 'bg-[#EAB52F] text-[#091D49] border-[#EAB52F]'
                  : 'bg-[#123675]/80 text-white border-white/15 hover:bg-white/10'
              }`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fit Width</span>
            </button>

            <div className="px-3 py-2 rounded-xl bg-[#123675]/80 border border-white/15 text-xs font-mono-num font-semibold text-white">
              Page {currentPage} / {totalPages}
            </div>

            <button
              type="button"
              onClick={toggleFullScreen}
              aria-label={isExpanded ? 'Exit expanded mode' : 'Expand reading mode'}
              title={isExpanded ? 'Exit Expanded Mode' : 'Expanded Reading Mode'}
              className="p-2 rounded-xl bg-[#123675]/80 hover:bg-white/10 border border-white/15 text-white transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="bg-[#0F172A] px-4 py-1.5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <BookOpenCheck className="w-3.5 h-3.5 text-[#EAB52F]" />
            <span>Continuous Vertical Reading Mode · Protected View</span>
          </div>
          <div className="flex items-center gap-3 w-48 sm:w-64">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#EAB52F] transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono-num text-[#EAB52F] font-bold w-10 text-right">
              {scrollProgress}%
            </span>
          </div>
        </div>

        {/* Continuous Vertical Scroll Document Stage */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 md:p-8 space-y-6 bg-[#1E293B]"
        >
          {loading && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-10 text-[#17233B] shadow-xl flex flex-col items-center justify-center space-y-4 min-h-[420px]">
              <Loader2 className="w-9 h-9 text-[#123675] animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-serif-heading text-lg font-bold text-[#123675]">
                  Preparing Document Pages...
                </p>
                <p className="text-xs text-[#687080]">
                  Loading high-resolution pages in EXAMORA Internal PDF Viewer
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="max-w-xl mx-auto bg-[#FFFDFA] rounded-2xl p-8 text-[#17233B] shadow-xl border-2 border-red-300 text-center space-y-4 my-10">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif-heading text-xl font-bold text-[#091D49]">
                Document Access Restricted or Unavailable
              </h3>
              <p className="text-sm text-[#687080] leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="examora-btn-navy px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              >
                Return to Library
              </button>
            </div>
          )}

          {/* Render either PDF.js Canvas Images (if custom binary uploaded) OR Crisp White Academic PDF Sheets */}
          {!loading &&
            !error &&
            docData &&
            (renderedCanvases.length > 0
              ? renderedCanvases.map((dataUrl, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      pageRefs.current[idx] = el;
                    }}
                    style={effectiveWidthStyle}
                    className="mx-auto bg-white text-[#17233B] shadow-[0_12px_32px_rgba(0,0,0,0.35)] rounded-sm overflow-hidden"
                  >
                    <img
                      src={dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-auto block"
                    />
                  </div>
                ))
              : docData.pages.map((page, idx) => (
                  <article
                    key={page.pageNumber || idx}
                    ref={(el) => {
                      pageRefs.current[idx] = el;
                    }}
                    style={effectiveWidthStyle}
                    className="mx-auto bg-white text-[#17233B] shadow-[0_12px_32px_rgba(0,0,0,0.35)] rounded-sm overflow-hidden border border-slate-200 transition-all duration-150"
                  >
                    {/* Authentic Academic PDF Sheet Header */}
                    <div className="bg-[#123675] text-white px-6 sm:px-10 py-4 border-b-4 border-[#EAB52F] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#EAB52F] shrink-0" />
                        <span className="text-xs font-bold tracking-wider uppercase">
                          EXAMORA PAKISTAN · OFFICIAL STUDY SHEET
                        </span>
                      </div>
                      <span className="text-xs font-mono-num font-bold text-[#EAB52F]">
                        Page {idx + 1} of {docData.pages.length}
                      </span>
                    </div>

                    {/* PDF Sheet Body (Strictly White Page #FFFFFF & Dark Ink #17233B regardless of theme) */}
                    <div
                      className="p-6 sm:p-10 md:p-12 space-y-6 bg-white text-[#17233B]"
                      style={{
                        fontSize: `${Math.max(13, Math.round(16 * (zoom / 100)))}px`,
                      }}
                    >
                      {idx === 0 && (
                        <div className="pb-5 border-b-2 border-slate-200 space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#123675]">
                            {docData.subtitle}
                          </p>
                          <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#091D49]">
                            {docData.title}
                          </h1>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h2 className="font-serif-heading text-xl font-bold text-[#123675]">
                          {idx + 1}. {page.heading}
                        </h2>
                        {page.subheading && (
                          <p className="text-xs font-semibold text-[#687080]">
                            {page.subheading}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4 leading-relaxed text-[#17233B]">
                        {page.paragraphs.map((para, pIdx) => (
                          <p key={pIdx} className="text-justify">
                            {para}
                          </p>
                        ))}
                      </div>

                      {page.keyPoints && page.keyPoints.length > 0 && (
                        <div className="mt-6 p-5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] space-y-2.5">
                          <h3 className="font-serif-heading text-sm font-bold text-[#091D49]">
                            Key Competitive Exam Takeaways:
                          </h3>
                          <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#17233B]">
                            {page.keyPoints.map((pt, kIdx) => (
                              <li key={kIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* PDF Sheet Footer */}
                      <div className="pt-8 mt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#687080]">
                        <span>
                          {page.footerNote ||
                            'EXAMORA PAKISTAN — Competitive Exam Preparation Library'}
                        </span>
                        <span className="font-mono-num">
                          Sheet {idx + 1} / {docData.pages.length}
                        </span>
                      </div>
                    </div>
                  </article>
                )))}
        </div>
      </div>
    </div>
  );
};
