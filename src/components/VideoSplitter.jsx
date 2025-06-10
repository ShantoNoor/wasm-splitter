import { useEffect, useRef, useState } from "react";
import { formatTime } from "../lib/formatTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Upload, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoSplitter = () => {
  const [video, setVideo] = useState(null);
  const [splitTime, setSplitTime] = useState(30); // Default to 30 minutes
  const [videoDuration, setVideoDuration] = useState(0);
  const [segments, setSegments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoDuration > 0 && video) {
      const segmentCount = Math.ceil(videoDuration / (splitTime * 60));
      const newSegments = [];
      const fileName = video.name.split(".").slice(0, -1).join(".");
      const fileExtension = video.name.split(".").pop();

      for (let i = 0; i < segmentCount; i++) {
        const fromTime = i * splitTime * 60;
        const toTime = Math.min((i + 1) * splitTime * 60, videoDuration);
        newSegments.push({
          id: i,
          from: fromTime,
          to: toTime,
          isProcessing: false,
          isProcessed: false,
          name: `${fileName}-${i + 1}.${fileExtension}`,
        });
      }
      setSegments(newSegments);
    }
  }, [videoDuration, splitTime, video]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith("video/")) {
      setVideo(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setVideoDuration(video.duration);
      };
      video.src = URL.createObjectURL(file);
    } else {
      alert("Please upload a valid video file.");
    }
  };

  const handleSplitTimeChange = (value) => {
    setSplitTime(value[0]);
  };

  const handleProcess = (id) => {
    setSegments(
      segments.map((segment) =>
        segment.id === id ? { ...segment, isProcessing: true } : segment
      )
    );
    // Simulate processing
    setTimeout(() => {
      setSegments(
        segments.map((segment) =>
          segment.id === id
            ? { ...segment, isProcessing: false, isProcessed: true }
            : segment
        )
      );
    }, 2000);
  };

  const handleDownload = (id) => {
    console.log(`Downloading segment ${id}`);
    // Implement actual download logic here
  };

  if (!video) {
    return (
      <div
        className={`border border-dashed rounded-lg p-8 mt-8 text-center ${
          dragActive ? "border-primary bg-primary/10" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-1">
          Drag and drop a video file here, or click to select a file
        </p>
        <input
          type="file"
          className="hidden"
          onChange={handleChange}
          accept="video/*"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Select File
        </label>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-3 border border-dashed rounded-lg p-4 sticky top-4">
        <video
          ref={videoRef}
          src={URL.createObjectURL(video)}
          controls
          className="w-full mb-4"
        />
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">
            Select Split Time (minutes)
          </h2>
          <Slider
            value={[splitTime]}
            onValueChange={handleSplitTimeChange}
            min={1}
            max={60}
            step={1}
          />
          <p className="mt-2">Split every {splitTime} minutes</p>
        </div>
      </div>

      {segments.length > 0 && (
        <div className="border rounded-lg p-4 flex-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>{segment.name}</TableCell>
                  <TableCell>{formatTime(segment.from)}</TableCell>
                  <TableCell>{formatTime(segment.to)}</TableCell>
                  <TableCell>
                    {segment.isProcessed ? (
                      <Button onClick={() => handleDownload(segment.id)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    ) : segment.isProcessing ? (
                      <Button disabled>Processing...</Button>
                    ) : (
                      <Button onClick={() => handleProcess(segment.id)}>
                        <Play className="mr-2 h-4 w-4" /> Process
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VideoSplitter;
