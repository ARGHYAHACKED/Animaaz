import React from "react";

const Sad: React.FC = () => (
  <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-blue-600 mb-4">Sad Anime</h1>
    <p className="text-lg text-gray-700">Anime for when you want to feel and reflect.</p>
    {/* Add anime list or fetch logic here */}
  </div>
);

export default Sad;
