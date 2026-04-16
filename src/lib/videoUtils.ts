export const extractFrames = (
  videoFile: File, 
  numFrames: number = 13,
  onProgress?: (current: number, total: number) => void
): Promise<{base64: string, highResBlobUrl: string}[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration === 0 || isNaN(duration)) {
        reject(new Error("Invalid video duration"));
        return;
      }
      
      const interval = duration / (numFrames + 1);
      const frames: {base64: string, highResBlobUrl: string}[] = [];
      let currentFrame = 1;

      const captureFrame = () => {
        if (currentFrame > numFrames) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }

        video.currentTime = currentFrame * interval;
      };

      video.onseeked = () => {
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;

        const hrCanvas = document.createElement('canvas');
        hrCanvas.width = originalWidth;
        hrCanvas.height = originalHeight;
        const hrCtx = hrCanvas.getContext('2d');
        if (hrCtx) {
          hrCtx.drawImage(video, 0, 0, originalWidth, originalHeight);
        }

        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = originalWidth;
        let height = originalHeight;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        const lrCanvas = document.createElement('canvas');
        lrCanvas.width = width;
        lrCanvas.height = height;
        const lrCtx = lrCanvas.getContext('2d');
        if (lrCtx) {
          lrCtx.drawImage(video, 0, 0, width, height);
        }

        const base64 = lrCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        hrCanvas.toBlob((blob) => {
          if (blob) {
            const highResBlobUrl = URL.createObjectURL(blob);
            frames.push({ base64, highResBlobUrl });
          }
          if (onProgress) {
            onProgress(currentFrame, numFrames);
          }
          currentFrame++;
          captureFrame();
        }, 'image/png');
      };

      video.onerror = (e) => {
        reject(new Error("Error loading video"));
      };

      captureFrame();
    };
    
    video.load();
  });
};
