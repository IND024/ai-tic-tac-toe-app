import React, { useEffect, useRef, useState } from 'react';
import { Winner } from '../types';

interface WinningLineProps {
  winnerInfo: Winner;
}

const getCoords = (index: number): { x: number; y: number } => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = ((col * 2 + 1) / 6) * 100;
    const y = ((row * 2 + 1) / 6) * 100;
    return { x, y };
};

const WinningLine: React.FC<WinningLineProps> = ({ winnerInfo }) => {
    const lineRef = useRef<SVGLineElement>(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        // Reset and prepare for animation whenever the winner changes
        setShouldAnimate(false);
        if (winnerInfo && lineRef.current) {
            const line = lineRef.current;
            // The line's length needs to be calculated for the dash animation.
            // Using a brief timeout allows the DOM to update before we measure.
            const measureTimer = setTimeout(() => {
                const length = line.getTotalLength();
                line.style.strokeDasharray = `${length}`;
                line.style.strokeDashoffset = `${length}`;

                // Trigger the animation by adding the 'animate' class
                const animateTimer = setTimeout(() => {
                    setShouldAnimate(true);
                }, 50); // Small delay to ensure styles are applied and transition triggers
                
                return () => clearTimeout(animateTimer);
            }, 0);
            
            return () => clearTimeout(measureTimer);
        }
    }, [winnerInfo]);

    if (!winnerInfo) {
        return null;
    }

    const startCoords = getCoords(winnerInfo.line[0]);
    const endCoords = getCoords(winnerInfo.line[2]);
    const winnerColor = winnerInfo.player === 'P1' ? 'stroke-cyan-400' : 'stroke-amber-400';

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <line
                ref={lineRef}
                x1={startCoords.x}
                y1={startCoords.y}
                x2={endCoords.x}
                y2={endCoords.y}
                className={`winning-line ${shouldAnimate ? 'animate' : ''} ${winnerColor} opacity-90`}
                strokeWidth="5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default WinningLine;
