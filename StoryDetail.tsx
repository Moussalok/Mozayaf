
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Languages, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { INITIAL_STORIES } from '../constants';
import { translateText, generateSpeech } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const story = INITIAL_STORIES.find(s => s.id === id);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  if (!story) return <div className="p-20 text-center">Story not found</div>;

  const handleTranslate = async () => {
    if (translatedContent) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateText(story.content);
      setTranslatedContent(result);
      setShowTranslation(true);
    } catch (err) {
      console.error(err);
      alert("Translation failed. Check your API key or connection.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        pauseTimeRef.current = audioContextRef.current!.currentTime - startTimeRef.current;
      }
      setIsPlaying(false);
      return;
    }

    if (!audioBuffer) {
      setIsGeneratingAudio(true);
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const buffer = await generateSpeech(story.content, audioContextRef.current);
        setAudioBuffer(buffer);
        playBuffer(buffer, 0);
      } catch (err) {
        console.error(err);
        alert("Audio generation failed.");
      } finally {
        setIsGeneratingAudio(false);
      }
    } else {
      playBuffer(audioBuffer, pauseTimeRef.current);
    }
  };

  const playBuffer = (buffer: AudioBuffer, offset: number) => {
    if (!audioContextRef.current) return;
    
    if (sourceNodeRef.current) sourceNodeRef.current.stop();
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      if (offset + (audioContextRef.current!.currentTime - startTimeRef.current) >= buffer.duration) {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
      }
    };

    startTimeRef.current = audioContextRef.current.currentTime - offset;
    source.start(0, offset);
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} /> Back to Library
      </button>

      <div className="relative rounded-3xl overflow-hidden aspect-[16/9] shadow-2xl">
        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="px-3 py-1 bg-sky-500 text-white rounded-full text-xs font-bold mb-4 inline-block">
            {story.category}
          </span>
          <h1 className="text-4xl font-extrabold text-white">{story.title}</h1>
        </div>
      </div>

      <div className="sticky top-20 glass rounded-2xl p-3 flex items-center justify-center gap-4 z-20 shadow-xl border border-white/10">
        <button 
          onClick={handlePlayPause}
          disabled={isGeneratingAudio}
          className="flex items-center gap-2 px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all disabled:opacity-50"
        >
          {isGeneratingAudio ? <Loader2 className="animate-spin" size={20} /> : (isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />)}
          <span className="font-bold">{isPlaying ? "Pause Audio" : "Listen to Story"}</span>
        </button>

        <button 
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex items-center gap-2 px-6 py-2 glass hover:bg-white/10 rounded-xl transition-all border border-sky-500/20 text-sky-400 font-bold"
        >
          {isTranslating ? <Loader2 className="animate-spin" size={20} /> : <Languages size={20} />}
          <span>{showTranslation ? "Show English Only" : "Translate Smart"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 story-content">
        <div className={`space-y-6 text-lg text-slate-200 transition-all ${showTranslation ? 'md:border-r border-white/10 pr-6' : 'md:col-span-2 max-w-2xl mx-auto'}`}>
          {story.content.split('\n').map((para, i) => (
            <p key={i} className="leading-relaxed first-letter:text-4xl first-letter:font-bold first-letter:text-sky-400">{para}</p>
          ))}
        </div>

        <AnimatePresence>
          {showTranslation && translatedContent && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 text-xl text-sky-100/90 arabic leading-loose text-right"
            >
              <div className="flex items-center gap-2 justify-end mb-4 text-sky-400">
                <span className="text-sm font-bold uppercase tracking-widest">AI Translation</span>
                <Sparkles size={16} />
              </div>
              {translatedContent.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryDetail;
