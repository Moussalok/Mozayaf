
import React, { useState, useEffect } from 'react';
import StoryCard from '../components/StoryCard';
import { INITIAL_STORIES } from '../constants';
import { Story } from '../types';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [stories] = useState<Story[]>(INITIAL_STORIES);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('musa_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('musa_favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Explore Stories</h2>
        <p className="text-slate-400 max-w-lg italic">"Language is the road map of a culture. It tells you where its people come from and where they are going."</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story, idx) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <StoryCard 
              story={story} 
              isFavorite={favorites.includes(story.id)}
              onToggleFavorite={(e) => {
                e.preventDefault();
                toggleFavorite(story.id);
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
