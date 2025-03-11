
import MoonScene from '../components/MoonScene';
import InfoOverlay from '../components/InfoOverlay';

const Index = () => {
  return (
    <div className="relative w-full h-screen bg-space-black overflow-hidden">
      <MoonScene />
      <InfoOverlay />
    </div>
  );
};

export default Index;
