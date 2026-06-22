import { useState, useEffect } from 'react';

const TypingAnimation = ({ words, typingSpeed = 150, deletingSpeed = 100, pauseTime = 2000 }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleTyping = () => {
            const currentFullWord = words[currentWordIndex];

            if (isDeleting) {
                // Deleting text
                setCurrentText(currentFullWord.substring(0, currentText.length - 1));

                if (currentText === '') {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                }
            } else {
                // Typing text
                setCurrentText(currentFullWord.substring(0, currentText.length + 1));

                if (currentText === currentFullWord) {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), pauseTime);
                    return;
                }
            }
        };

        const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

    return (
        <span className="inline-block min-w-[300px]">
            {currentText}
            <span className="animate-pulse border-r-4 border-emerald-600 ml-1">&nbsp;</span>
        </span>
    );
};

export default TypingAnimation;
