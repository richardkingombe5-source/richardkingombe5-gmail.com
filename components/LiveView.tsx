import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GeminiModel } from '../types';
import { Mic, MicOff, Video, VideoOff, Power, Activity } from 'lucide-react';

// Helper for Base64 encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
      resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const LiveView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputAudioContext;
      audioContextRef.current = outputAudioContext;
      
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;

      // Setup Video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const sessionPromise = ai.live.connect({
        model: GeminiModel.LIVE,
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setStatus('connected');
            setIsConnected(true);
            
            // Setup Audio Input Stream
            const source = inputAudioContext.createMediaStreamSource(stream);
            // NOTE: ScriptProcessor is deprecated but required by instructions
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMicOn) return; // Mute logic
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
               const ctx = audioContextRef.current;
               if (!ctx) return;

               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 ctx,
                 24000,
                 1
               );

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
               });

               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
             console.log('Session closed');
             stopSession();
          },
          onerror: (err) => {
            console.error('Session error', err);
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are a helpful, witty AI assistant. You can see the user via video and hear them.",
        }
      });
      
      sessionRef.current = sessionPromise;

      // Video Frame Streaming
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        const ctx = canvas.getContext('2d');
        frameIntervalRef.current = window.setInterval(() => {
          if (!isCameraOn || !ctx) return;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              const base64 = await blobToBase64(blob);
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64, mimeType: 'image/jpeg' }
                });
              });
            }
          }, 'image/jpeg', 0.8);

        }, 1000 / 2); // 2 FPS to save bandwidth
      }

    } catch (e) {
      console.error("Failed to start session", e);
      setStatus('disconnected');
    }
  };

  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (sessionRef.current) {
        // Can't easily close session object from promise wrapper without accessing internal, 
        // but the 'live.connect' doesn't return a direct close method on the promise itself.
        // Usually we wait for the promise to resolve to get the session, then close.
        sessionRef.current.then((session: any) => {
            if (session.close) session.close();
        });
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    
    setIsConnected(false);
    setStatus('disconnected');
    sourcesRef.current.clear();
  };

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleCam = () => setIsCameraOn(!isCameraOn);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background Pulse Effect when active */}
      {isConnected && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
         </div>
      )}

      {/* Main Video/Status Area */}
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <video 
            ref={videoRef} 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${status === 'connected' ? 'opacity-100' : 'opacity-30'}`} 
            muted 
            playsInline 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {status === 'disconnected' && (
                <div className="text-center p-8 pointer-events-auto">
                    <Activity className="w-20 h-20 mx-auto text-indigo-500 mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Gemini Live</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Experience real-time multimodal interaction with Gemini 2.5. 
                        Stream audio and video for a fluid conversation.
                    </p>
                    <button 
                        onClick={startSession}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
                    >
                        <Power size={20} /> Start Session
                    </button>
                </div>
            )}
            
            {status === 'connecting' && (
                 <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                     <span className="font-medium text-lg text-indigo-300">Establishing Uplink...</span>
                 </div>
            )}
        </div>

        {/* Control Bar (Only visible when connected) */}
        {status === 'connected' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/50 shadow-xl pointer-events-auto">
                <button 
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
                >
                    {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button 
                    onClick={toggleCam}
                    className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
                >
                    {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
                <div className="w-px h-8 bg-slate-700 mx-2"></div>
                <button 
                    onClick={stopSession}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-transform hover:scale-105"
                >
                    <Power size={24} />
                </button>
            </div>
        )}
        
        {/* Status Badge */}
        {status === 'connected' && (
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">LIVE</span>
            </div>
        )}
      </div>
    </div>
  );
};