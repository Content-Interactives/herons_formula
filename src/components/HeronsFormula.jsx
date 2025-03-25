import React, { useState } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';

const HeronsFormulaInteractive = () => {
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [sideC, setSideC] = useState('');
  const [area, setArea] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState({ semiPerimeter: '', area: '' });
  const [inputStatus, setInputStatus] = useState({ semiPerimeter: null, area: null });
  const [stepCompleted, setStepCompleted] = useState({ semiPerimeter: false, area: false });

  const validateInput = () => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);

    if (isNaN(a) || isNaN(b) || isNaN(c) || a <= 0 || b <= 0 || c <= 0 || a > 100 || b > 100 || c > 100 || (a + b <= c) || (b + c <= a) || (a + c <= b)) {
      setError("Please enter valid side lengths between 0 and 100. The sum of any two sides must be greater than the third side.");
      return false;
    }

    setError('');
    return true;
  };

  const calculateArea = () => {
    if (!validateInput()) {
      setArea(null);
      setSteps([]);
      return;
    }

    setIsCalculating(true);

    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);
    const s = (a + b + c) / 2;
    const areaValue = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    const newSteps = [
      { 
        main: `Step 1: Calculate the semi-perimeter (s)`, 
        formula: `s = (a + b + c) / 2
s = (${a} + ${b} + ${c}) / 2`, 
        answer: s.toFixed(2) 
      },
      { 
        main: `Step 2: Apply Heron's Formula to calculate the area`, 
        formula: `A = √(s(s-a)(s-b)(s-c))
A = √(${s.toFixed(2)}(${s.toFixed(2)}-${a})(${s.toFixed(2)}-${b})(${s.toFixed(2)}-${c}))`,
        answer: areaValue.toFixed(2) 
      },
    ];

    setArea(areaValue.toFixed(2));
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setUserInputs({ semiPerimeter: '', area: '' });
    setInputStatus({ semiPerimeter: null, area: null });
    setStepCompleted({ semiPerimeter: false, area: false });
    setIsCalculating(false);
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    setError('');
  };

  const handleStepInputChange = (e, field) => {
    setUserInputs({ ...userInputs, [field]: e.target.value });
    setInputStatus({ ...inputStatus, [field]: null });
  };

  const checkStep = (field) => {
    let isCorrect = false;
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);
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
      setStepCompleted({ ...stepCompleted, [field]: true });
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  };

  const skipStep = (field) => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);
    const s = (a + b + c) / 2;
    const actualArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    setUserInputs({ 
      ...userInputs, 
      [field]: field === 'semiPerimeter' ? s.toFixed(2) : actualArea.toFixed(2) 
    });
    setInputStatus({ ...inputStatus, [field]: 'correct' });
    setStepCompleted({ ...stepCompleted, [field]: true });
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const getInputClassName = (field) => {
    let baseClass = "text-xs px-1 text-left";
    switch (inputStatus[field]) {
      case 'correct':
        return `${baseClass} border-green-500`;
      case 'incorrect':
        return `${baseClass} border-red-500`;
      default:
        return `${baseClass} border-gray-300`;
    }
  };

  const getInputStyle = (field) => {
    return {
      width: field === 'semiPerimeter' ? '160px' : '120px'
    };
  };

  const generateRandomSides = () => {
    let a, b, c;
    do {
      a = Math.floor(Math.random() * 100) + 1;
      b = Math.floor(Math.random() * 100) + 1;
      const min = Math.abs(a - b) + 1;
      const max = Math.min(a + b - 1, 100);
      c = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (a + b <= c || b + c <= a || a + c <= b);

    setSideA(a.toString());
    setSideB(b.toString());
    setSideC(c.toString());
    setError('');
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <div className="w-full max-w-2xl mx-auto shadow-md bg-white">
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-grow flex space-x-2">
                <input
                  type="number"
                  value={sideA}
                  onChange={(e) => handleInputChange(e, setSideA)}
                  placeholder="Side A"
                  className="w-1/3 text-lg border border-gray-200 p-2 rounded focus:outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  value={sideB}
                  onChange={(e) => handleInputChange(e, setSideB)}
                  placeholder="Side B"
                  className="w-1/3 text-lg border border-gray-200 p-2 rounded focus:outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  value={sideC}
                  onChange={(e) => handleInputChange(e, setSideC)}
                  placeholder="Side C"
                  className="w-1/3 text-lg border border-gray-200 p-2 rounded focus:outline-none focus:border-blue-400"
                />
              </div>
              <button 
                onClick={generateRandomSides}
                className="flex items-center bg-sky-500 hover:bg-sky-600 text-white p-2 rounded h-10 whitespace-nowrap"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Random
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <button 
              onClick={calculateArea} 
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-white text-xl py-6 rounded"
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Area'}
            </button>
          </div>
        </div>
        <div className="flex-col items-start bg-gray-50 p-4">
          {steps.length > 0 && (
            <div className="w-full space-y-2">
              <p className="font-semibold text-purple-600">Calculation Steps:</p>
              {steps.slice(0, currentStepIndex + 1).map((step, index) => (
                <div key={index} className="bg-purple-50 p-2 rounded">
                  <p>{step.main}</p>
                  <pre className="text-sm whitespace-pre-wrap">{step.formula}</pre>
                  {stepCompleted[Object.keys(stepCompleted)[index]] && (
                    <p className="text-green-600">
                      = {step.answer}
                    </p>
                  )}
                  {index === currentStepIndex && !stepCompleted[Object.keys(stepCompleted)[index]] && (
                    <div className="flex items-center space-x-1 text-sm mt-2">
                      <input
                        type="number"
                        value={userInputs[Object.keys(userInputs)[index]]}
                        onChange={(e) => handleStepInputChange(e, Object.keys(userInputs)[index])}
                        placeholder={`Enter ${Object.keys(userInputs)[index]}`}
                        className={getInputClassName(Object.keys(userInputs)[index])}
                        style={getInputStyle(Object.keys(userInputs)[index])}
                      />
                      <button 
                        onClick={() => checkStep(Object.keys(userInputs)[index])} 
                        className="bg-blue-400 hover:bg-blue-500 text-white px-2 py-1 text-xs rounded"
                      >
                        Check
                      </button>
                      <button 
                        onClick={() => skipStep(Object.keys(userInputs)[index])} 
                        className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 text-xs rounded"
                      >
                        Skip
                      </button>
                      {inputStatus[Object.keys(userInputs)[index]] === 'correct' && <Check className="text-green-500 w-4 h-4" />}
                      {inputStatus[Object.keys(userInputs)[index]] === 'incorrect' && <X className="text-red-500 w-4 h-4" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeronsFormulaInteractive;