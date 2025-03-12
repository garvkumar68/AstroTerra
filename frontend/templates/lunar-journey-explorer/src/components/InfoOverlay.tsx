
import { useState } from 'react';
import { Info, X, Moon, Compass, Star } from 'lucide-react';

const InfoOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-500`}
    >
      <div className="absolute top-4 left-4 p-6 bg-space-black/80 backdrop-blur-md rounded-lg border border-space-silver/10 pointer-events-auto animate-fade-in max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-space-silver animate-float" />
            <h1 className="text-space-white text-2xl font-light">Luna Explorer</h1>
          </div>
          <Star className="w-5 h-5 text-space-silver/60" />
        </div>
        <p className="text-space-silver/80 text-sm mb-4">
          Experience an accurate 3D representation of Earth's only natural satellite.
          Navigate using your mouse or touch controls.
        </p>
        <div className="flex items-center gap-2 text-space-silver/60 text-xs">
          <Compass className="w-4 h-4" />
          <span>Click and drag to rotate • Scroll to zoom • Double-click to reset view</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 p-6 bg-space-black/80 backdrop-blur-md rounded-lg border border-space-silver/10 pointer-events-auto animate-fade-in max-w-md">
        <h2 className="text-space-white text-lg font-light mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-space-silver/60" />
          Lunar Facts
        </h2>
        <ul className="text-space-silver/80 text-sm space-y-3">
          <li className="flex items-center gap-2">
            <span className="w-32 text-space-silver/60">Distance from Earth:</span>
            <span>384,400 km</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-32 text-space-silver/60">Diameter:</span>
            <span>3,475 km</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-32 text-space-silver/60">Surface gravity:</span>
            <span>1.62 m/s²</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-32 text-space-silver/60">Orbital period:</span>
            <span>27.3 days</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-32 text-space-silver/60">Surface temperature:</span>
            <span>-233°C to 123°C</span>
          </li>
        </ul>
      </div>

      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 px-4 py-2 bg-space-black/80 backdrop-blur-md rounded-lg border border-space-silver/10 text-space-silver hover:bg-space-gray/80 transition-colors pointer-events-auto flex items-center gap-2"
      >
        {isVisible ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        <span>{isVisible ? 'Hide Info' : 'Show Info'}</span>
      </button>
    </div>
  );
};

export default InfoOverlay;
