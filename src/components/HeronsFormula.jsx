import React, { useState, useCallback, useRef, useEffect } from 'react';

const HeronsFormula = () => {
  const [points, setPoints] = useState([
    { x: 200, y: 100 },
    { x: 300, y: 100 },
    { x: 250, y: 200 }
  ]);
  const [area, setArea] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState({ semiPerimeter: '', area: '' });
  const [inputStatus, setInputStatus] = useState({ semiPerimeter: null, area: null });
  const [stepCompleted, setStepCompleted] = useState({ semiPerimeter: false, area: false });
  const [stepSkipped, setStepSkipped] = useState({ semiPerimeter: false, area: false });
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isGlowActive, setIsGlowActive] = useState(true);
  const svgRef = useRef(null);
  const [showNavigationButtons, setShowNavigationButtons] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState(null);
  const [leftButtonVisible, setLeftButtonVisible] = useState(false);

  // Add useEffect to handle navigation button visibility
  useEffect(() => {
    // Show navigation buttons when both steps are completed and we're on the final step
    if (stepCompleted.semiPerimeter && stepCompleted.area) {
      if (currentStepIndex === 2) {
        setShowNavigationButtons(true);
        setLeftButtonVisible(true);
      }
    } else {
      setShowNavigationButtons(false);
      setLeftButtonVisible(false);
    }
  }, [stepCompleted, currentStepIndex]);

  const calculateSideLengths = () => {
    const [p1, p2, p3] = points;
    const a = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
    const b = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
    const c = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    
    // Find the maximum possible length in the SVG viewport
    const maxPossibleLength = Math.sqrt(500 * 500 + 300 * 300);
    const scaleFactor = 99 / maxPossibleLength;
    
    // Scale the lengths to range from 1 to 100
    const scaledA = Math.max(1, Math.round(a * scaleFactor + 1));
    const scaledB = Math.max(1, Math.round(b * scaleFactor + 1));
    const scaledC = Math.max(1, Math.round(c * scaleFactor + 1));
    
    return { a: scaledA, b: scaledB, c: scaledC };
  };

  const validateInput = () => {
    const { a, b, c } = calculateSideLengths();

    if (a <= 0 || b <= 0 || c <= 0 || (a + b <= c) || (b + c <= a) || (a + c <= b)) {
      setError("Invalid triangle: The sum of any two sides must be greater than the third side.");
      return false;
    }

    setError('');
    return true;
  };

  const calculateSteps = () => {
    if (!validateInput()) {
      setArea(null);
      setSteps([]);
      setShowNavigationButtons(false);
      return;
    }

    setIsCalculating(true);
    setIsGlowActive(false);  // Disable the glow effect when calculating
    setShowNavigationButtons(false); // Hide navigation buttons when calculating new area
    setStepCompleted({ semiPerimeter: false, area: false }); // Reset step completion
    setStepSkipped({ semiPerimeter: false, area: false }); // Reset step skipped state
    const { a, b, c } = calculateSideLengths();
    const s = (a + b + c) / 2;
    const areaValue = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    const newSteps = [
      { 
        main: `Step 1: Calculate the semi-perimeter (s)`, 
        formula: `s = (a + b + c) / 2
s = (${a.toFixed(2)} + ${b.toFixed(2)} + ${c.toFixed(2)}) / 2`, 
        answer: s.toFixed(2) 
      },
      { 
        main: `Step 2: Apply Heron's Formula to calculate the area`, 
        formula: `A = √(s(s-a)(s-b)(s-c))
A = √(${s.toFixed(2)}(${s.toFixed(2)}-${a.toFixed(2)})(${s.toFixed(2)}-${b.toFixed(2)})(${s.toFixed(2)}-${c.toFixed(2)}))`,
        answer: areaValue.toFixed(2) 
      },
      {
        main: `Step 3: Final Result`,
        formula: ``,
        answer: areaValue.toFixed(2)
      }
    ];

    setArea(areaValue.toFixed(2));
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setUserInputs({ semiPerimeter: '', area: '' });
    setInputStatus({ semiPerimeter: null, area: null });
    setIsCalculating(false);
  };

  const handleMouseDown = useCallback((index, e) => {
    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    const point = points[index];
    
    // Calculate the offset between the touch/mouse position and the point's position
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const offsetX = (clientX - CTM.e) / CTM.a - point.x;
    const offsetY = (clientY - CTM.f) / CTM.d - point.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragIndex(index);
  }, [points]);

  const handleMouseMove = useCallback((e) => {
    if (dragIndex !== null) {
      const svg = svgRef.current;
      const CTM = svg.getScreenCTM();
      
      // Get touch or mouse coordinates
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (!clientX || !clientY) return;
      
      // Calculate the new point position accounting for the offset
      const x = (clientX - CTM.e) / CTM.a - dragOffset.x;
      const y = (clientY - CTM.f) / CTM.d - dragOffset.y;
      
      // Constrain points to stay within the padded area (10px from edges)
      const constrainedX = Math.max(10, Math.min(490, x));
      const constrainedY = Math.max(10, Math.min(290, y));
      
      const newPoints = [...points];
      newPoints[dragIndex] = { x: constrainedX, y: constrainedY };
      
      // Calculate the side lengths with the new position
      const [p1, p2, p3] = newPoints;
      const a = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
      const b = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
      const c = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      
      // Find the maximum possible length in the SVG viewport
      const maxPossibleLength = Math.sqrt(500 * 1000 + 200 * 200);
      const scaleFactor = 99 / maxPossibleLength;
      
      // Check if any scaled length would be less than 1
      const scaledA = Math.max(1, Math.round(a * scaleFactor + 1));
      const scaledB = Math.max(1, Math.round(b * scaleFactor + 1));
      const scaledC = Math.max(1, Math.round(c * scaleFactor + 1));
      
      if (scaledA >= 1 && scaledB >= 1 && scaledC >= 1) {
        setPoints(newPoints);
      }
    }
  }, [dragIndex, dragOffset, points]);

  const handleMouseUp = useCallback(() => {
    setDragIndex(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const getSideLengths = () => {
    const [p1, p2, p3] = points;
    const a = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
    const b = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
    const c = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    
    const maxPossibleLength = Math.sqrt(500 * 500 + 300 * 300);
    const scaleFactor = 99 / maxPossibleLength;
    
    const scaledA = Math.max(1, Math.round(a * scaleFactor + 1));
    const scaledB = Math.max(1, Math.round(b * scaleFactor + 1));
    const scaledC = Math.max(1, Math.round(c * scaleFactor + 1));
    
    return { a: scaledA, b: scaledB, c: scaledC };
  };

  const renderTriangle = () => {
    const { a, b, c } = getSideLengths();
    const [p1, p2, p3] = points;

    return (
      <div className="flex gap-4 mb-4">
        {/* Side length legend */}
        <div className="flex flex-col justify-center gap-2 w-[80px]">
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-[#FF6B6B] text-center">a = {a}</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-[#4ECDC4] text-center">b = {b}</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-[#45B7D1] text-center">c = {c}</span>
          </div>
        </div>

        {/* Triangle visualization */}
        <div className="border border-[#7973E9]/30 rounded-lg p-4 flex-1 min-w-[300px] min-h-[200px]">
          <svg 
            ref={svgRef}
            viewBox="0 0 500 300" 
            width="100%" 
            height="200"
            className="w-full h-[200px]"
            style={{ touchAction: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Side a (p2-p3) */}
            <line
              x1={p2.x}
              y1={p2.y}
              x2={p3.x}
              y2={p3.y}
              stroke="#FF6B6B"
              strokeWidth="2"
            />
            
            {/* Side b (p1-p3) */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p3.x}
              y2={p3.y}
              stroke="#4ECDC4"
              strokeWidth="2"
            />
            
            {/* Side c (p1-p2) */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#45B7D1"
              strokeWidth="2"
            />
            
            <polygon
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="#5750E3"
              fillOpacity="0.1"
              stroke="none"
            />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="8"
                fill="#5750E3"
                stroke="white"
                strokeWidth="1"
                style={{ cursor: 'move' }}
                onMouseDown={(e) => handleMouseDown(index, e)}
                onTouchStart={(e) => handleMouseDown(index, e)}
              />
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const handleStepInputChange = (e, field) => {
    setUserInputs({ ...userInputs, [field]: e.target.value });
    setInputStatus({ ...inputStatus, [field]: null });
  };

  const checkStep = (field) => {
    let isCorrect = false;
    const { a, b, c } = calculateSideLengths();
    const s = (a + b + c) / 2;
    const actualArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    switch (field) {
      case 'semiPerimeter':
        isCorrect = Math.abs(parseFloat(userInputs.semiPerimeter) - s) < 0.01;
        break;
      case 'area':
        isCorrect = Math.abs(parseFloat(userInputs.area) - actualArea) < 0.01;
        break;
    }

    setInputStatus({ ...inputStatus, [field]: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) {
      setStepCompleted(prev => ({ ...prev, [field]: true }));
      setStepSkipped(prev => ({ ...prev, [field]: false }));
    }
  };

  const skipStep = (field) => {
    const { a, b, c } = calculateSideLengths();
    const s = (a + b + c) / 2;
    const actualArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    setUserInputs({ 
      ...userInputs, 
      [field]: field === 'semiPerimeter' ? s.toFixed(2) : actualArea.toFixed(2) 
    });
    setInputStatus({ ...inputStatus, [field]: 'correct' });
    setStepCompleted(prev => ({ ...prev, [field]: true }));
    setStepSkipped(prev => ({ ...prev, [field]: true }));
  };

  const getInputClassName = (field) => {
    let baseClass = "text-xs px-1 text-left";
    switch (inputStatus[field]) {
      case 'correct':
        return `${baseClass} border-green-500`;
      case 'incorrect':
        return `${baseClass} border-yellow-500`;
      default:
        return `${baseClass} border-gray-300`;
    }
  };

  const getInputStyle = (field) => {
    return {
      width: field === 'semiPerimeter' ? '180px' : '140px'
    };
  };

  const handleNavigateHistory = (direction) => {
    setNavigationDirection(direction);
    
    if (direction === 'back' && currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else if (direction === 'forward' && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }

    // Reset direction after animation
    setTimeout(() => {
      setNavigationDirection(null);
    }, 300);
  };

  return (
    <>
      <style>{`
        @property --r {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        .glow-button { 
          min-width: auto; 
          height: auto; 
          position: relative; 
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          transition: all .3s ease;
          padding: 7px;
        }

        .glow-button::before {
          content: "";
          display: block;
          position: absolute;
          background: #fff;
          inset: 2px;
          border-radius: 4px;
          z-index: -2;
        }

        .simple-glow {
          background: conic-gradient(
            from var(--r),
            transparent 0%,
            rgb(0, 255, 132) 2%,
            rgb(0, 214, 111) 8%,
            rgb(0, 174, 90) 12%,
            rgb(0, 133, 69) 14%,
            transparent 15%
          );
          animation: rotating 3s linear infinite;
          transition: animation 0.3s ease;
        }

        .simple-glow.stopped {
          animation: none;
          background: none;
        }

        @keyframes rotating {
          0% {
            --r: 0deg;
          }
          100% {
            --r: 360deg;
          }
        }

        .nav-button {
          opacity: 1;
          cursor: default !important;
          position: relative;
          z-index: 2;
          outline: 2px white solid;
        }

        .nav-button-orbit {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(
            from var(--r),
            transparent 0%,
            rgb(0, 255, 132) 2%,
            rgb(0, 214, 111) 8%,
            rgb(0, 174, 90) 12%,
            rgb(0, 133, 69) 14%,
            transparent 15%
          );
          animation: rotating 3s linear infinite;
          z-index: 0;
        }

        .nav-button-orbit::before {
          content: "";
          position: absolute;
          inset: 2px;
          background: transparent;
          border-radius: 50%;
          z-index: 0;
        }

        .nav-button svg {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <div className="w-[500px] h-auto mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] bg-white rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center">
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Drag the points to change the lengths of the triangle:</p>
            <div className="relative">
              {renderTriangle()}
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <div className={`glow-button ${isGlowActive ? 'simple-glow' : 'simple-glow stopped'}`}>
              <button 
                onClick={calculateSteps} 
                className="w-full bg-[#008545] hover:bg-[#00703d] text-white text-sm py-2 rounded"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Area'}
              </button>
            </div>
          </div>
        </div>
        
        {steps.length > 0 && (
          <div className="p-4 bg-gray-50">
            <div className="space-y-2">
              <h3 className="text-[#5750E3] text-sm font-medium mb-2">
                Steps to calculate the area:
              </h3>
              <div className="space-y-4">
                <div className="w-full p-2 mb-1 bg-white border border-[#5750E3]/30 rounded-md">
                  {currentStepIndex === 0 ? (
                    <>
                      <p className="text-sm">{steps[currentStepIndex].main}</p>
                      <pre className="text-sm whitespace-pre-wrap mt-1">{steps[currentStepIndex].formula}</pre>
                      {stepCompleted[Object.keys(stepCompleted)[currentStepIndex]] && (
                        <p className="text-sm text-[#008545] font-medium mt-1">
                          = {steps[currentStepIndex].answer}
                        </p>
                      )}
                      {!stepCompleted[Object.keys(stepCompleted)[currentStepIndex]] && (
                        <div className="flex items-center space-x-1 mt-2">
                          <input
                            type="number"
                            value={userInputs[Object.keys(userInputs)[currentStepIndex]]}
                            onChange={(e) => handleStepInputChange(e, Object.keys(userInputs)[currentStepIndex])}
                            placeholder={`Enter ${Object.keys(userInputs)[currentStepIndex]}`}
                            className={`w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3] ${
                              inputStatus[Object.keys(userInputs)[currentStepIndex]] === 'correct'
                                ? 'border-green-500'
                                : inputStatus[Object.keys(userInputs)[currentStepIndex]] === 'incorrect'
                                ? 'border-yellow-500'
                                : 'border-gray-300'
                            }`}
                            style={getInputStyle(Object.keys(userInputs)[currentStepIndex])}
                          />
                          <div className="glow-button simple-glow">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => checkStep(Object.keys(userInputs)[currentStepIndex])} 
                                className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px]"
                              >
                                Check
                              </button>
                              <button 
                                onClick={() => skipStep(Object.keys(userInputs)[currentStepIndex])} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md min-w-[80px]"
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {stepCompleted[Object.keys(stepCompleted)[currentStepIndex]] && !showNavigationButtons && (
                        <div className="flex items-center gap-4 mt-2 justify-end">
                          {!stepSkipped[Object.keys(stepSkipped)[currentStepIndex]] && (
                            <span className="text-green-600 font-bold select-none">Great Job!</span>
                          )}
                          {currentStepIndex < steps.length - 1 && (
                            <div className="glow-button simple-glow">
                              <button 
                                onClick={() => {
                                  if (currentStepIndex < steps.length - 1) {
                                    setCurrentStepIndex(prev => prev + 1);
                                  }
                                }}
                                className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px]"
                              >
                                Continue
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : currentStepIndex === 1 ? (
                    <>
                      <p className="text-sm">{steps[currentStepIndex].main}</p>
                      <pre className="text-sm whitespace-pre-wrap mt-1">{steps[currentStepIndex].formula}</pre>
                      {stepCompleted[Object.keys(stepCompleted)[currentStepIndex]] && (
                        <p className="text-sm text-[#008545] font-medium mt-1">
                          = {steps[currentStepIndex].answer}
                        </p>
                      )}
                      {!stepCompleted[Object.keys(stepCompleted)[currentStepIndex]] && (
                        <div className="flex items-center space-x-1 mt-2">
                          <input
                            type="number"
                            value={userInputs[Object.keys(userInputs)[currentStepIndex]]}
                            onChange={(e) => handleStepInputChange(e, Object.keys(userInputs)[currentStepIndex])}
                            placeholder={`Enter ${Object.keys(userInputs)[currentStepIndex]}`}
                            className={`w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3] ${
                              inputStatus[Object.keys(userInputs)[currentStepIndex]] === 'correct'
                                ? 'border-green-500'
                                : inputStatus[Object.keys(userInputs)[currentStepIndex]] === 'incorrect'
                                ? 'border-yellow-500'
                                : 'border-gray-300'
                            }`}
                            style={getInputStyle(Object.keys(userInputs)[currentStepIndex])}
                          />
                          <div className="glow-button simple-glow">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => checkStep(Object.keys(userInputs)[currentStepIndex])} 
                                className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px]"
                              >
                                Check
                              </button>
                              <button 
                                onClick={() => skipStep(Object.keys(userInputs)[currentStepIndex])} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md min-w-[80px]"
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {stepCompleted[Object.keys(stepCompleted)[currentStepIndex]] && !showNavigationButtons && (
                        <div className="flex items-center gap-4 mt-2 justify-end">
                          {!stepSkipped[Object.keys(stepSkipped)[currentStepIndex]] && (
                            <span className="text-green-600 font-bold select-none">Great Job!</span>
                          )}
                          {currentStepIndex < steps.length - 1 && (
                            <div className="glow-button simple-glow">
                              <button 
                                onClick={() => {
                                  if (currentStepIndex < steps.length - 1) {
                                    setCurrentStepIndex(prev => prev + 1);
                                  }
                                }}
                                className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px]"
                              >
                                Continue
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm">Step 3: Calculation Complete!</p>
                      <div className="mt-2 flex justify-center items-center gap-1">
                        <p className="text-[#008545] text-xl font-bold">{steps[1].answer} square units</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div
                    className="nav-orbit-wrapper"
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      visibility: showNavigationButtons && currentStepIndex > 0 ? 'visible' : 'hidden',
                      opacity: showNavigationButtons && currentStepIndex > 0 ? 1 : 0,
                      pointerEvents: showNavigationButtons && currentStepIndex > 0 ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <div className="nav-button-orbit"></div>
                    {/* Mask to hide orbit under button */}
                    <div style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'white', zIndex: 1 }}></div>
                    <button
                      onClick={() => handleNavigateHistory('back')}
                      className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/20 text-[#008545] hover:bg-[#008545]/30 relative z-50 grow-in`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 min-w-[100px] text-center">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                  <div
                    className="nav-orbit-wrapper"
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      visibility: showNavigationButtons && currentStepIndex < steps.length - 1 ? 'visible' : 'hidden',
                      opacity: showNavigationButtons && currentStepIndex < steps.length - 1 ? 1 : 0,
                      pointerEvents: showNavigationButtons && currentStepIndex < steps.length - 1 ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <div className="nav-button-orbit"></div>
                    {/* Mask to hide orbit under button */}
                    <div style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'white', zIndex: 1 }}></div>
                    <button
                      onClick={() => handleNavigateHistory('forward')}
                      className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/20 text-[#008545] hover:bg-[#008545]/30 relative z-50`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HeronsFormula;