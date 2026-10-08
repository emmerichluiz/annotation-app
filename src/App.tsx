import { ChangeEvent, PointerEvent, useEffect, useState } from 'react';
import type { Annotation, AnnotationType, UploadedDocument } from './types';

const STORAGE_KEY = 'annotation-app-v1';

type Tool = AnnotationType | 'select';

function App() {
  const [tool, setTool] = useState<Tool>('rect');
  const [color, setColor] = useState('#ff5d5d');
  const [documentData, setDocumentData] = useState<UploadedDocument | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as Annotation[];
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState<{
    type: AnnotationType;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }, [annotations]);

  useEffect(() => {
    return () => {
      if (documentData?.src) {
        URL.revokeObjectURL(documentData.src);
      }
    };
  }, [documentData]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const src = URL.createObjectURL(file);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    setDocumentData({
      id: crypto.randomUUID(),
      name: file.name,
      type: isPdf ? 'pdf' : 'image',
      src,
      mimeType: file.type,
    });

    setAnnotations([]);
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (!documentData || tool === 'select') {
      return;
    }

    const svgRect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - svgRect.left) / svgRect.width) * 100;
    const y = ((event.clientY - svgRect.top) / svgRect.height) * 100;

    if (tool === 'text') {
      const comment = window.prompt('Digite o comentário:');
      if (!comment || !comment.trim()) {
        return;
      }

      const annotation: Annotation = {
        id: crypto.randomUUID(),
        type: 'text',
        x,
        y,
        width: 0,
        height: 0,
        color,
        text: comment.trim(),
      };

      setAnnotations((current) => [...current, annotation]);
      return;
    }

    setDraft({
      type: tool,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!draft) {
      return;
    }

    const svgRect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - svgRect.left) / svgRect.width) * 100;
    const y = ((event.clientY - svgRect.top) / svgRect.height) * 100;

    setDraft((current) => {
      if (!current) {
        return null;
      }

      return {
        ...current,
        currentX: x,
        currentY: y,
      };
    });
  };

  const handlePointerUp = () => {
    if (!draft) {
      return;
    }

    const { type, startX, startY, currentX, currentY } = draft;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    if (width < 1 && height < 1) {
      setDraft(null);
      return;
    }

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
      width,
      height,
      color,
    };

    setAnnotations((current) => [...current, annotation]);
    setDraft(null);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  const renderAnnotation = (annotation: Annotation) => {
    const commonProps = {
      key: annotation.id,
      stroke: annotation.color,
      strokeWidth: 1.6,
      fill: annotation.type === 'rect' ? 'rgba(255,255,255,0.08)' : 'transparent',
      vectorEffect: 'non-scaling-stroke' as const,
    };

    if (annotation.type === 'rect') {
      return <rect {...commonProps} x={annotation.x} y={annotation.y} width={annotation.width} height={annotation.height} rx={2} />;
    }

    if (annotation.type === 'arrow') {
      const startX = annotation.x;
      const startY = annotation.y + annotation.height / 2;
      const endX = annotation.x + annotation.width;
      const endY = annotation.y + annotation.height / 2;
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLength = 4;
      const leftX = endX - headLength * Math.cos(angle - Math.PI / 6);
      const leftY = endY - headLength * Math.sin(angle - Math.PI / 6);
      const rightX = endX - headLength * Math.cos(angle + Math.PI / 6);
      const rightY = endY - headLength * Math.sin(angle + Math.PI / 6);

      return (
        <g key={annotation.id}>
          <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={annotation.color} strokeWidth={1.6} />
          <polygon points={`${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`} fill={annotation.color} />
        </g>
      );
    }

    return (
      <g key={annotation.id}>
        <text x={annotation.x} y={annotation.y} fill={annotation.color} fontSize={4} fontWeight={700}>
          {annotation.text}
        </text>
      </g>
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">MVP</p>
          <h1>Annotation App</h1>
        </div>

        <label className="upload-button">
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
          <span>Carregar arquivo</span>
        </label>

        <div className="toolbar-panel">
          <h2>Ferramentas</h2>
          <div className="tool-grid">
            {(['select', 'rect', 'arrow', 'text'] as const).map((item) => (
              <button
                key={item}
                className={`tool-button ${tool === item ? 'active' : ''}`}
                onClick={() => setTool(item)}
              >
                {item === 'select' ? 'Selecionar' : item === 'rect' ? 'Retângulo' : item === 'arrow' ? 'Seta' : 'Texto'}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-panel">
          <h2>Cor</h2>
          <div className="color-row">
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="color-picker"
            />
            <span>{color}</span>
          </div>
        </div>

        <div className="toolbar-panel">
          <h2>Anotações</h2>
          <button className="secondary-button" onClick={clearAnnotations}>
            Limpar todas
          </button>
        </div>
      </aside>

      <main className="workspace">
        {!documentData ? (
          <div className="empty-state">
            <div className="empty-panel">
              <h2>Comece carregando um arquivo</h2>
              <p>Você pode usar imagens ou PDFs para criar marcações, comentários e destaques.</p>
            </div>
          </div>
        ) : (
          <>
            <header className="document-header">
              <div>
                <p className="eyebrow">Arquivo atual</p>
                <h2>{documentData.name}</h2>
              </div>
            </header>

            <div className="document-stage">
              {documentData.type === 'image' ? (
                <img src={documentData.src} alt={documentData.name} className="document-media" />
              ) : (
                <iframe title={documentData.name} src={documentData.src} className="document-media pdf-frame" />
              )}

              <svg
                className="annotation-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {annotations.map(renderAnnotation)}

                {draft && (
                  <g>
                    {draft.type === 'rect' ? (
                      <rect
                        x={Math.min(draft.startX, draft.currentX)}
                        y={Math.min(draft.startY, draft.currentY)}
                        width={Math.abs(draft.currentX - draft.startX)}
                        height={Math.abs(draft.currentY - draft.startY)}
                        stroke={color}
                        fill="rgba(255,255,255,0.08)"
                        strokeWidth={1.6}
                        vectorEffect="non-scaling-stroke"
                        rx={2}
                      />
                    ) : (
                      <>
                        <line
                          x1={draft.startX}
                          y1={draft.startY}
                          x2={draft.currentX}
                          y2={draft.currentY}
                          stroke={color}
                          strokeWidth={1.6}
                        />
                        <polygon
                          points={`${draft.currentX},${draft.currentY} ${draft.currentX - 2.5},${draft.currentY - 1.8} ${draft.currentX - 1.2},${draft.currentY - 3.2}`}
                          fill={color}
                        />
                      </>
                    )}
                  </g>
                )}
              </svg>
            </div>
          </>
        )}
      </main>

      {annotations.length > 0 && documentData && (
        <aside className="comment-panel">
          <h3>Lista de anotações</h3>
          <div className="annotation-list">
            {annotations.map((annotation) => (
              <div key={annotation.id} className="annotation-item">
                <div className="annotation-item-header">
                  <span className="annotation-tag" style={{ backgroundColor: annotation.color }} />
                  <strong>{annotation.type === 'rect' ? 'Retângulo' : annotation.type === 'arrow' ? 'Seta' : 'Texto'}</strong>
                </div>
                {annotation.type === 'text' ? <p>{annotation.text}</p> : <p>Posição: {annotation.x.toFixed(1)} / {annotation.y.toFixed(1)}</p>}
                <button
                  className="delete-button"
                  onClick={() => setAnnotations((current) => current.filter((item) => item.id !== annotation.id))}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
