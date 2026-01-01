
export interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface TranslationResult {
  translatedText: string;
}
