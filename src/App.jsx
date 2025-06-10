import { useEffect, useState } from "react";
import Loading from "./components/Loading";
import VideoSplitter from "./components/VideoSplitter";
import { ffmpeg } from "./lib/ffmpeg";
import { ModeToggle } from "./components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator"

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await ffmpeg.load();
      setReady(true);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex-1" />
          <h1 className="flex-1 text-3xl font-bold text-center">WASM Video Splitter</h1>
          <div className="flex-1 text-right"><ModeToggle className="flex-1" /></div>
        </div>
        <Separator className="my-4" />
        {ready ? <VideoSplitter /> : <Loading />}
      </div>
    </div>
  );
}

export default App;
