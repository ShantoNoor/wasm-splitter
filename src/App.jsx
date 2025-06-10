import { useEffect, useState } from "react";
import Loading from "./components/Loading";
import VideoSplitter from "./components/VideoSplitter";
import { ModeToggle } from "./components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "./components/ui/sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
const ffmpeg = new FFmpeg();

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await ffmpeg.load();
        setReady(true);
      } catch (er) {
        console.log(er);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex-1" />
          <h1 className="flex-1 text-3xl font-bold text-center">
            WASM Video Splitter
          </h1>
          <div className="flex-1 text-right">
            <ModeToggle className="flex-1" />
          </div>
        </div>
        <Separator className="my-4" />
        {ready ? <VideoSplitter ffmpeg={ffmpeg} /> : <Loading />}
      </div>
      <Toaster position="top-center" closeButton richColors />
    </div>
  );
}

export default App;
