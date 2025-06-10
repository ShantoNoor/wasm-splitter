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
import { Separator } from "./ui/separator";
import { fetchFile } from "@ffmpeg/util";
import { ffmpeg } from "../lib/ffmpeg";
import { toast } from "sonner";

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

  const handleFile = async (file) => {
    const tid = toast.loading("Loading ...");

    if (file.type.startsWith("video/")) {
      try {
        await ffmpeg.writeFile(`input/${file.name}`, await fetchFile(file));
      } catch (e) {
        toast.dismiss(tid);
        toast.error("Unable to writeFile");
        console.log(e);
        return;
      }

      // const files = await ffmpeg.listDir("input/");
      // console.log("Files in the virtual filesystem:", files);

      setVideo(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        setVideoDuration(video.duration);
      };
      video.src = URL.createObjectURL(file);
    } else {
      toast.warning("Please upload a valid video file.");
    }
    toast.dismiss(tid);
  };

  const handleSplitTimeChange = (value) => {
    setSplitTime(value[0]);
  };

  const handleProcess = async (id) => {
    setSegments((segments) =>
      segments.map((segment) => {
        return id == segment.id
          ? { ...segment, isProcessing: true, isProcessed: false }
          : { ...segment, isProcessed: false };
      })
    );

    setSegments((segments) =>
      segments.map((segment) => {
        return id == segment.id
          ? { ...segment, isProcessing: false, isProcessed: true }
          : segment;
      })
    );
  };

  const handleDownload = (id) => {
    alert(`Downloading segment ${id}`);
    // Implement actual download logic here
  };

  if (!video) {
    return (
      <div
        className={`border border-dashed rounded-lg p-12 mt-8 text-center ${
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
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Select File
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <div className="flex-2 border border-dashed rounded-lg p-4 lg:sticky lg:top-4">
        <video
          ref={videoRef}
          src={URL.createObjectURL(video)}
          controls
          className="w-full mb-4"
        />
        <Separator className="my-4" />
        <div>
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
        <div className="border rounded-lg p-4 flex-3 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>{segment.name}</TableCell>
                  <TableCell>{formatTime(segment.from)}</TableCell>
                  <TableCell>{formatTime(segment.to)}</TableCell>
                  <TableCell className="max-w-30 text-center">
                    {segment.isProcessed ? (
                      <Button
                        className="text-white w-30"
                        onClick={() => handleDownload(segment.id)}
                      >
                        <Download className="mr-1 h-4 w-4" /> Download
                      </Button>
                    ) : segment.isProcessing ? (
                      <Button className="w-30" variant="outline" disabled>
                        Processing ...
                      </Button>
                    ) : (
                      <Button
                        className="w-30"
                        variant="outline"
                        onClick={() => handleProcess(segment.id)}
                      >
                        <Play className="mr-1 h-4 w-4" /> Process
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
