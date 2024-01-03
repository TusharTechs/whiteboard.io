/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { jsPDF } from "jspdf";
import { Socket } from "socket.io-client";
import {
  BsBrush,
  BsArrowCounterclockwise,
  BsArrowClockwise,
} from "react-icons/bs";
import { FiDownload, FiVideo } from "react-icons/fi";
import { FaFileDownload } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { RxDotFilled } from "react-icons/rx";
import { GoDotFill } from "react-icons/go";
import { FaArrowTurnDown, FaRegCommentDots } from "react-icons/fa6";
import { PiDownloadDuotone } from "react-icons/pi";
import "bootstrap/dist/css/bootstrap.min.css";
import ImageDetector from "./ImageDetector";
import Chat from "./Chat";

type ShapeType = "circle" | "text" | "line";

interface Shape {
  x: number;
  y: number;
  type: ShapeType;
  points?: number[];
  color?: string;
  strokeWidth?: number;
}

interface WhiteboardProps {
  socket: Socket;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ socket }) => {
  const [mode, setMode] = useState<"brush" | "shape">("brush");
  const [lines, setLines] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<Konva.Shape | null>(null);
  const [undoStack, setUndoStack] = useState<Shape[][]>([]);
  const [redoStack, setRedoStack] = useState<Shape[][]>([]);
  const [currentBrushSize, setCurrentBrushSize] = useState<number>(2);
  const [currentColor, setCurrentColor] = useState<string>("black");
  const [showChat, setShowChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedMedia, setRecordedMedia] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isDrawing = useRef(false);
  const ImageDetectorRef = useRef<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const canvasWidth = showChat ? "8" : "12";

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...audioStream.getTracks(),
      ]);
      setRecordedMedia(combinedStream);

      const recorder = new MediaRecorder(combinedStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
      };

      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      console.warn("No recorded data available for download.");
      return;
    }

    const recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    const downloadUrl = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = downloadUrl;
    a.download = "recorded-video.webm";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const scrollAndPerformOperation = (
    mode:
      | "text"
      | "brush"
      | "undo"
      | "redo"
      | "color"
      | "brushSize2"
      | "brushSize5"
      | "brushSize10"
      | "saveImage"
      | "savePDF"
      | "showChat"
  ) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.scrollIntoView({ behavior: "smooth" });

      switch (mode) {
        case "text":
          break;
        case "brush":
          setMode("brush");
          break;
        case "undo":
          handleUndo();
          break;
        case "redo":
          handleRedo();
          break;
        case "color":
          break;
        case "brushSize2":
          handleBrushSizeChange(2);
          break;
        case "brushSize5":
          handleBrushSizeChange(5);
          break;
        case "brushSize10":
          handleBrushSizeChange(10);
          break;
        case "saveImage":
          handleSaveAsImage();
          break;
        case "savePDF":
          handleSaveAsPDF();
          break;
        case "showChat":
          setTimeout(() => {
            setShowChat(!showChat);
          }, 500);
          break;
        default:
          break;
      }
    }
  };

  const handleSaveAsImage = () => {
    const dataURL = stageRef.current?.toDataURL();
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = dataURL || "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAsPDF = () => {
    const pdf = new jsPDF("p", "px", [
      window.innerWidth,
      window.innerHeight - 100,
    ]);

    const dataURL = stageRef.current?.toDataURL();

    if (dataURL) {
      const img = new Image();
      img.src = dataURL;

      img.onload = () => {
        pdf.addImage(
          img,
          "PNG",
          0,
          0,
          window.innerWidth,
          window.innerHeight - 100
        );
        pdf.save("whiteboard.pdf");
      };
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode === "brush") {
      isDrawing.current = true;
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setLines([
          ...lines,
          {
            type: "line",
            points: [pos.x, pos.y],
            color: currentColor,
            strokeWidth: currentBrushSize,
            x: pos.x,
            y: pos.y,
          },
        ]);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode === "brush" && isDrawing.current) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos && lines.length > 0) {
        const updatedLines = lines.slice();
        const lastLine = updatedLines[updatedLines.length - 1];
        lastLine.points = lastLine.points?.concat([pos.x, pos.y]) || [];
        setLines(updatedLines);
      }
    }
  };

  const handleMouseUp = () => {
    if (mode === "brush") {
      isDrawing.current = false;
      setUndoStack([...undoStack, lines]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      const updatedUndoStack = undoStack.slice(0, -1);
      setRedoStack([lines, ...redoStack]);
      setLines(lastAction);
      setUndoStack(updatedUndoStack);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextAction = redoStack[redoStack.length - 1];
      const updatedRedoStack = redoStack.slice(0, -1);
      setUndoStack([...undoStack, lines]);
      setLines(nextAction);
      setRedoStack(updatedRedoStack);
    }
  };

  const changeStrokeColor = (color: string) => {
    if (selectedShape) {
      setSelectedShape(null);
    }
    setCurrentColor(color);
  };

  const handleBrushSizeChange = (size: number) => {
    setCurrentBrushSize(size);
  };

  const sendDataToServer = (data: Shape[]) => {
    socket.emit("drawing", data);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const emitDataWithDelay = () => {
      timeoutId = setTimeout(() => {
        sendDataToServer(lines);
      }, 2000);
    };

    socket.on("drawing", (data: Shape[]) => {
      setLines(data);
    });

    if (lines.length > 0) {
      emitDataWithDelay();
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [lines, socket]);

  useEffect(() => {
    if (selectedShape) {
      trRef.current?.nodes([selectedShape]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [selectedShape]);

  return (
    <div className="container mt-3" style={{ overflowX: "hidden" }}>
      <h3
        className="text-center"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        WHITEBOARD.IO
      </h3>
      <div className="text-center">
        <span className="text-muted">
          Get Image prediction <FaArrowTurnDown />
        </span>
      </div>
      <div className="mb-3 d-flex justify-content-center align-items-center">
        <ImageDetector ref={ImageDetectorRef} />
      </div>
      <div
        className="text-center"
        style={{ cursor: "pointer" }}
        onClick={() => scrollAndPerformOperation("text")}
      >
        <span className="text-muted">
          Go to Whiteboard <FaArrowTurnDown />
        </span>
      </div>
      <div className="my-3 d-flex justify-content-center align-items-center">
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("brush")}
        >
          <BsBrush />
        </button>
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("undo")}
        >
          <BsArrowCounterclockwise />
        </button>
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("redo")}
        >
          <BsArrowClockwise />
        </button>
        <input
          type="color"
          className="form-control form-control-color me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("color")}
          onChange={(e) => changeStrokeColor(e.target.value)}
        />
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("brushSize2")}
        >
          <LuDot />
        </button>
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("brushSize5")}
        >
          <RxDotFilled />
        </button>
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("brushSize10")}
        >
          <GoDotFill />
        </button>
      </div>
      <div className="my-3 d-flex justify-content-center align-items-center">
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("saveImage")}
        >
          <FaFileDownload />
        </button>
        <button
          className="btn btn-outline-secondary me-2 btn-sm"
          onClick={() => scrollAndPerformOperation("savePDF")}
        >
          <FiDownload />
        </button>
        <button
          className={`btn btn-outline-secondary me-2 btn-sm ${
            showChat ? "btn-primary" : ""
          }`}
          onClick={() => scrollAndPerformOperation("showChat")}
        >
          <FaRegCommentDots />
        </button>
        <button
          className={`btn btn-outline-secondary me-2 btn-sm ${
            isRecording ? "btn-danger" : ""
          }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <FiVideo style={{ color: isRecording ? "white" : "" }} />
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={downloadRecording}
          disabled={recordedChunks.length === 0}
        >
          <PiDownloadDuotone />
        </button>
      </div>
      <div className="row">
        <div className={`col-md-${canvasWidth}`}>
          <div ref={canvasRef}>
            <Stage
              width={window.innerWidth}
              height={window.innerHeight - 100}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={stageRef}
            >
              <Layer>
                {lines.map((line, index) => {
                  if (line.type === "line" && line.points) {
                    return (
                      <Line
                        key={index}
                        points={line.points}
                        stroke={line.color || "black"}
                        strokeWidth={line.strokeWidth || 2}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>
        {showChat && (
          <div className="col-md-4 position-relative">
            <div className="chat-panel">
              <Chat socket={socket} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
