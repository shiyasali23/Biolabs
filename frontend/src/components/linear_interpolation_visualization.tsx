// import { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// export default function LinearInterpolationVisualization() {
//   const [minValue, setMinValue] = useState(10);
//   const [maxValue, setMaxValue] = useState(100);
//   const [threshold, setThreshold] = useState(0.5);
//   const [result, setResult] = useState(0);
//   const [data, setData] = useState([]);
  
//   // Linear interpolation function
//   const linearInterpolation = (t, min, max) => {
//     if (t === 0) return min;
//     if (t === 1) return max;
//     return min + (max - min) * t;
//   };
  
//   // Update the result and graph data whenever inputs change
//   useEffect(() => {
//     const interpolatedValue = linearInterpolation(threshold, minValue, maxValue);
//     setResult(interpolatedValue);
    
//     // Generate data points for the graph
//     const graphData = [];
//     for (let i = 0; i <= 10; i++) {
//       const t = i / 10;
//       graphData.push({
//         t,
//         value: linearInterpolation(t, minValue, maxValue)
//       });
//     }
    
//     // Add the current threshold point with special marker
//     graphData.push({
//       t: threshold,
//       value: interpolatedValue,
//       current: interpolatedValue
//     });
    
//     setData(graphData.sort((a, b) => a.t - b.t));
//   }, [threshold, minValue, maxValue]);
  
//   return (
//     <div className="flex flex-col p-6 bg-gray-50 rounded-lg max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold text-gray-800 mb-2">Linear Interpolation Visualization</h1>
//       <p className="text-gray-600 mb-6">
//         A lightweight, efficient algorithm (O(1) time complexity) for mapping values from one range to another.
//       </p>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-3">Interactive Parameters</h2>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Threshold (t): {threshold.toFixed(2)}
//             </label>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={threshold}
//               onChange={(e) => setThreshold(parseFloat(e.target.value))}
//               className="w-full"
//             />
//             <div className="flex justify-between text-xs text-gray-500">
//               <span>0</span>
//               <span>0.5</span>
//               <span>1</span>
//             </div>
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Minimum Value: {minValue}
//             </label>
//             <input
//               type="range"
//               min="0"
//               max="50"
//               value={minValue}
//               onChange={(e) => setMinValue(parseInt(e.target.value))}
//               className="w-full"
//             />
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Maximum Value: {maxValue}
//             </label>
//             <input
//               type="range"
//               min="51"
//               max="200"
//               value={maxValue}
//               onChange={(e) => setMaxValue(parseInt(e.target.value))}
//               className="w-full"
//             />
//           </div>
          
//           <div className="bg-blue-50 p-3 rounded-md">
//             <h3 className="text-sm font-semibold text-blue-800 mb-1">Result:</h3>
//             <p className="text-xl font-mono">{result.toFixed(2)}</p>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-3">Algorithm Analysis</h2>
//           <ul className="space-y-2 text-sm">
//             <li className="flex items-start">
//               <span className="font-medium mr-2">Time Complexity:</span> 
//               <span>O(1) - Constant time regardless of input size</span>
//             </li>
//             <li className="flex items-start">
//               <span className="font-medium mr-2">Space Complexity:</span> 
//               <span>O(1) - Uses fixed memory regardless of input parameters</span>
//             </li>
//             <li className="flex items-start">
//               <span className="font-medium mr-2">Performance:</span> 
//               <span>Highly efficient with just 1 multiplication and 1 addition operation</span>
//             </li>
//             <li className="flex items-start">
//               <span className="font-medium mr-2">Applications:</span> 
//               <span>Graphics rendering, animation, token allocation, UI sliders, data normalization</span>
//             </li>
//           </ul>
          
//           <div className="mt-4 p-3 bg-gray-50 rounded-md">
//             <code className="text-xs font-mono">
//               result = min_value + (max_value - min_value) * threshold
//             </code>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white p-4 rounded-lg shadow-sm">
//         <h2 className="text-lg font-semibold mb-3">Visualization</h2>
//         <div className="h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart
//               data={data}
//               margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
//               <XAxis 
//                 dataKey="t" 
//                 label={{ value: 'Threshold (t)', position: 'bottom', offset: 0 }}
//                 domain={[0, 1]}
//                 tickCount={6}
//               />
//               <YAxis 
//                 domain={[Math.min(minValue - 5, 0), maxValue + 5]}
//                 label={{ value: 'Result', angle: -90, position: 'insideLeft' }}
//               />
//               <Tooltip formatter={(value) => value.toFixed(2)} />
//               <Line 
//                 type="monotone" 
//                 dataKey="value" 
//                 stroke="#4c1d95" 
//                 strokeWidth={2}
//                 dot={false}
//                 isAnimationActive={false}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="current" 
//                 stroke="#e11d48" 
//                 strokeWidth={0}
//                 dot={{ r: 6, fill: "#e11d48" }}
//                 activeDot={{ r: 8 }}
//                 isAnimationActive={false}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//         <p className="text-sm text-gray-600 mt-2">
//           The red dot represents the current interpolated value based on your threshold.
//         </p>
//       </div>
      
//       <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
//         <h2 className="text-lg font-semibold mb-3">Mathematical Foundation</h2>
//         <p className="text-sm mb-4">
//           Linear interpolation follows a straight line between two points (0,min_value) and (1,max_value).
//           For any threshold t between 0 and 1, the function calculates a weighted average:
//         </p>
        
//         <div className="bg-gray-50 p-3 rounded-md mb-4">
//           <code className="text-sm font-mono block mb-2">
//             result = min_value × (1-t) + max_value × t
//           </code>
//           <code className="text-sm font-mono block">
//             result = min_value + (max_value - min_value) × t
//           </code>
//         </div>
        
//         <p className="text-sm">
//           This means when t=0, the result is min_value, and when t=1, the result is max_value.
//           For any value in between, it produces a proportional blend of the two extremes.
//         </p>
//       </div>
//     </div>
//   );
// }