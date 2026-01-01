
import React, { useState, useEffect } from 'react';
import StoryCard from '../components/StoryCard';
import { INITIAL_STORIES } from '../constants';
import { Story } from '../types';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('musa_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const favoriteStories = INITIAL_STORIES.filter(s => favorites.includes(s.id));

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.filter(fav => fav !== id);
    setFavorites(newFavorites);
    localStorage.setItem('musa_favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Heart className="text-rose-500" fill="currentColor" size={32} />
        <h2 className="text-3xl font-extrabold">My Library</h2>
      </div>

      {favoriteStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteStories.map(story => (
            <StoryCard 
              key={story.id} 
              story={story} 
              isFavorite={true}
              onToggleFavorite={() => toggleFavorite(story.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 glass rounded-3xl border-dashed border-2">
          <Heart size={48} className="mb-4 opacity-20" />
          <p className="text-lg">You haven't added any favorites yet.</p>
          <p className="text-sm">Explore stories and tap the heart icon to save them here.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
