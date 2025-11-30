import React, { useState } from 'react';
import { generateImage } from '../services/gemini';
import { GeneratedImage } from '../types';
import { Sparkles, Download, Loader2, Image as ImageIcon } from 'lucide-react';

export const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const images = await generateImage(prompt, aspectRatio);
      const newImages = images.map(url => ({
        url,
        prompt,
        timestamp: Date.now()
      }));
      setGeneratedImages(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error("Image gen error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm z-10">
            <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 text-white">
                    <Sparkles className="text-purple-400" />
                    Imagine
                </h2>
                <p className="text-slate-400 text-sm mb-6">Create stunning visuals with Gemini 3 Pro</p>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A futuristic city on Mars, neon lights, cyberpunk style, high detail..."
                            className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerate();
                                }
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-4 min-w-[200px]">
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                            <option value="4:3">Standard (4:3)</option>
                            <option value="3:4">Vertical (3:4)</option>
                        </select>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.length === 0 && !isGenerating && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600">
                        <ImageIcon size={64} className="mb-4 opacity-50" />
                        <p className="text-lg">Your imagination is the limit. Start creating.</p>
                    </div>
                )}
                
                {isGenerating && (
                    <div className="aspect-square bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center animate-pulse">
                         <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-2" />
                         <span className="text-sm text-purple-400">Dreaming...</span>
                    </div>
                )}

                {generatedImages.map((img, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl transition-transform hover:-translate-y-1">
                        <img 
                            src={img.url} 
                            alt={img.prompt} 
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <p className="text-white text-sm line-clamp-2 mb-3">{img.prompt}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">{new Date(img.timestamp).toLocaleTimeString()}</span>
                                <a 
                                    href={img.url} 
                                    download={`gemini-nexus-${img.timestamp}.png`}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
                                >
                                    <Download size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};