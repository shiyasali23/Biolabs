import React from "react";

const LoadingComponent = ({ text = "Loading", className = "" }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <h2
        className={`text-2xl font-bold text-gray-700 ${className}`}
      >
        {text}
      </h2>
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
<div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
<div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce [animation-delay:0.15s]"></div>

      </div>
    </div>
  );
};

export default LoadingComponent;
