"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  X, Check, RotateCw, ZoomIn, ZoomOut, RotateCcw, 
  Maximize2, Move, Loader2, SlidersHorizontal
} from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
  aspectRatioPreset?: number; // e.g., 4 / 5
}

type AspectPreset = {
  label: string;
  value: number; // width / height
  badge?: string;
};

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Portrait 4:5", value: 4 / 5, badge: "Recommended" },
  { label: "Square 1:1", value: 1 / 1 },
  { label: "Classic 3:4", value: 3 / 4 },
];

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatioPreset = 4 / 5,
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(aspectRatioPreset);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [boxSize, setBoxSize] = useState<{ width: number; height: number }>({ width: 300, height: 375 });

  // Measure crop box dimensions
  const measureBox = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBoxSize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setAspectRatio(aspectRatioPreset);

      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setImgNaturalSize({
          width: imgRef.current.naturalWidth,
          height: imgRef.current.naturalHeight,
        });
      }

      const timer = setTimeout(measureBox, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, imageSrc, aspectRatioPreset, measureBox]);

  useEffect(() => {
    measureBox();
  }, [aspectRatio, measureBox]);

  // Load natural image dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    measureBox();
  };

  // Compute base rendered size so the image covers the frame at 1.0x without showing outside gaps
  const baseDims = useMemo(() => {
    const boxW = boxSize.width || 300;
    const boxH = boxSize.height || 375;
    const natW = imgNaturalSize.width || 800;
    const natH = imgNaturalSize.height || 1000;

    const isRot = rotation % 180 !== 0;
    const effW = isRot ? natH : natW;
    const effH = isRot ? natW : natH;
    const effAspect = effW / effH;
    const boxAspect = boxW / boxH;

    let displayEffW: number;
    let displayEffH: number;

    // Cover the box completely so there is never empty space
    if (effAspect >= boxAspect) {
      displayEffH = boxH;
      displayEffW = boxH * effAspect;
    } else {
      displayEffW = boxW;
      displayEffH = boxW / effAspect;
    }

    return {
      width: isRot ? displayEffH : displayEffW,
      height: isRot ? displayEffW : displayEffH,
    };
  }, [boxSize, imgNaturalSize, rotation]);

  // Boundary clamping: Prevents dragging the image outside of the crop frame
  const getClampedOffset = useCallback(
    (targetOffset: { x: number; y: number }, targetZoom = zoom, targetRot = rotation) => {
      const boxW = boxSize.width || 300;
      const boxH = boxSize.height || 375;
      const isRot = targetRot % 180 !== 0;
      const currentWidth = (isRot ? baseDims.height : baseDims.width) * targetZoom;
      const currentHeight = (isRot ? baseDims.width : baseDims.height) * targetZoom;

      const maxOffsetX = Math.max(0, (currentWidth - boxW) / 2);
      const maxOffsetY = Math.max(0, (currentHeight - boxH) / 2);

      return {
        x: Math.min(maxOffsetX, Math.max(-maxOffsetX, targetOffset.x)),
        y: Math.min(maxOffsetY, Math.max(-maxOffsetY, targetOffset.y)),
      };
    },
    [boxSize, baseDims, zoom, rotation]
  );

  // Re-clamp offset if baseDims or box changes
  useEffect(() => {
    setOffset((prev) => getClampedOffset(prev, zoom, rotation));
  }, [baseDims, boxSize, getClampedOffset, zoom, rotation]);

  // Safe Zoom handler with auto-clamping
  const handleZoomChange = (nextZoom: number) => {
    // Minimum zoom is 1.0 (never smaller than the crop box)
    const clampedZoom = Math.min(3.0, Math.max(1.0, Number(nextZoom.toFixed(2))));
    setZoom(clampedZoom);
    setOffset((prev) => getClampedOffset(prev, clampedZoom, rotation));
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const rawOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    setOffset(getClampedOffset(rawOffset));
  }, [isDragging, dragStart, getClampedOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const rawOffset = {
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    };
    setOffset(getClampedOffset(rawOffset));
  }, [isDragging, dragStart, getClampedOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
    handleZoomChange(zoom + zoomFactor);
  };

  // Window listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    setOffset({ x: 0, y: 0 });
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Execute Canvas Crop
  const handleCropAndApply = async () => {
    if (!imgRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // Output resolution target (sharp for retina screens)
      const targetWidth = 1200;
      const targetHeight = Math.round(targetWidth / aspectRatio);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not create canvas 2D context");

      // Draw clean background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Use the already loaded DOM image directly
      let img: HTMLImageElement = imgRef.current;

      if (!img.complete || img.naturalWidth === 0) {
        await new Promise<void>((resolve, reject) => {
          const tempImg = new Image();
          if (imageSrc.startsWith("http")) {
            tempImg.crossOrigin = "anonymous";
          }
          tempImg.onload = () => {
            img = tempImg;
            resolve();
          };
          tempImg.onerror = () => reject(new Error("Failed to load source image for cropping"));
          tempImg.src = imageSrc;
        });
      }

      // Ensure offset is strictly clamped within boundaries before export
      const finalClampedOffset = getClampedOffset(offset, zoom, rotation);

      // Scale factor between container coordinate space and canvas resolution
      const scaleToCanvas = targetWidth / containerRect.width;

      ctx.save();
      // Center canvas origin
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // Apply Clamped User Offset (scaled to canvas)
      ctx.translate(finalClampedOffset.x * scaleToCanvas, finalClampedOffset.y * scaleToCanvas);

      // Apply User Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply User Zoom
      ctx.scale(zoom, zoom);

      // Draw dimensions proportional to the on-screen preview baseDims
      const drawWidth = baseDims.width * scaleToCanvas;
      const drawHeight = baseDims.height * scaleToCanvas;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      // Convert canvas to Blob with multi-format fallback
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => {
            if (b) return resolve(b);
            canvas.toBlob(
              (b2) => {
                if (b2) return resolve(b2);
                try {
                  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
                  fetch(dataUrl)
                    .then((r) => r.blob())
                    .then(resolve)
                    .catch(() => resolve(null));
                } catch {
                  resolve(null);
                }
              },
              "image/jpeg",
              0.92
            );
          },
          "image/webp",
          0.92
        );
      });

      if (!blob) {
        throw new Error("Unable to create image blob from canvas.");
      }

      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(blob, previewUrl);
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      console.error("Crop error:", err);
      alert("Could not crop image: " + (err.message || String(err)));
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all select-none">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <SlidersHorizontal size={15} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">Crop Profile Portrait</h3>
              <p className="text-[11px] sm:text-xs text-gray-400">Position, zoom, and frame your portrait</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-50/80 border-b border-gray-100 flex-wrap gap-2 text-xs">
          <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
            <Maximize2 size={12} /> Aspect Ratio:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ASPECT_PRESETS.map((preset) => {
              const isSelected = Math.abs(aspectRatio - preset.value) < 0.01;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setAspectRatio(preset.value);
                    setOffset({ x: 0, y: 0 });
                    setZoom(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                    isSelected
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>{preset.label}</span>
                  {preset.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isSelected ? "bg-emerald-400 text-black" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {preset.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cropper Viewport */}
        <div 
          className="relative flex-1 bg-neutral-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[300px] sm:min-h-[340px] max-h-[460px]"
          onWheel={handleWheel}
        >
          {/* Draggable Frame Container */}
          <div
            ref={containerRef}
            className="relative overflow-hidden shadow-2xl rounded-2xl border-2 border-white cursor-grab active:cursor-grabbing transition-[width,height] duration-200 flex items-center justify-center bg-black"
            style={{
              width: aspectRatio <= 1 ? "min(100%, 280px)" : "min(100%, 340px)",
              aspectRatio: `${aspectRatio}`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* The Image — Boundary clamped: can never drag past edges or reveal empty space */}
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop Target"
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  width: `${baseDims.width}px`,
                  height: `${baseDims.height}px`,
                  maxWidth: "none",
                  maxHeight: "none",
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                className="pointer-events-none select-none transition-transform duration-75 object-cover"
              />
            )}

            {/* Grid Overlay / Rule of Thirds */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Hint Badge */}
            <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md pointer-events-none flex items-center gap-1 shadow-xs">
              <Move size={10} /> Drag to adjust
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="px-5 sm:px-6 py-3 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Zoom Slider (Strictly clamped to >= 1.0 so image always covers frame) */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-sm">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.1)}
              disabled={zoom <= 1.01}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg cursor-pointer transition-colors"
              title="Zoom Out (Minimum 100% to fill frame)"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min={1.0}
              max={3.0}
              step={0.02}
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.1)}
              disabled={zoom >= 2.99}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <span className="text-[11px] font-mono text-gray-500 w-11 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotate & Reset Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Rotate 90° clockwise"
            >
              <RotateCw size={13} />
              <span>Rotate</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset zoom, rotation, and position"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100 bg-gray-50/70">
          <p className="text-xs text-gray-400 hidden sm:block">
            Bounds locked • Image always covers frame
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-gray-600 hover:text-black bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropAndApply}
              disabled={isProcessing || !imageSrc}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-300 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span>Apply & Save Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
