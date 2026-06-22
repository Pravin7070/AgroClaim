import { useState, useEffect } from 'react';

export default function ImageCarousel({ images }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="relative w-full max-w-4xl mx-auto h-56 rounded-xl overflow-hidden shadow-lg">
            {images.map((img, idx) => (
                <img
                    key={idx}
                    src={img}
                    alt={`Agriculture ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        idx === current ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
        </div>
    );
}
