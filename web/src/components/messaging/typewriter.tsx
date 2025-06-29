import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TypewriterProps {
  text: string;
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

const Typewriter = ({ text, speed = 30, startDelay = 0, onComplete, onStart }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? startDelay : speed);
      return () => clearTimeout(timer);
    } else if (currentIndex >= text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, startDelay, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    if (onStart) {
      onStart();
    }
  }, [text, onStart]);

  return (
    <span>
      <Markdown remarkPlugins={[remarkGfm]}>{displayedText}</Markdown>
    </span>
  );
};

export default Typewriter; 