import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import promoVideo from '@/assets/promo-video.mp4';

const PromoVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="mx-4 mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">See Us In Action</h2>
        <p className="text-sm text-muted-foreground">Experience premium laundry care</p>
      </div>
      
      <div className="relative rounded-2xl overflow-hidden shadow-lg group">
        <video
          ref={videoRef}
          src={promoVideo}
          className="w-full aspect-video object-cover"
          loop
          muted={isMuted}
          playsInline
          poster=""
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Play/Pause button - center */}
        <Button
          variant="glass"
          size="icon"
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-glow transition-all duration-300 opacity-90 group-hover:opacity-100"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>
        
        {/* Mute button - bottom right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        
        {/* Badge */}
        <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
          🎬 Promo Video
        </div>
      </div>
    </section>
  );
};

export default PromoVideo;
