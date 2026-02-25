import React, { useState, useCallback, useRef, useEffect } from 'react';

// Define the type for calculator operators
type Operator = '+' | '-' | '*' | '/' | null;

export default function Home() {
  // State for the value currently displayed on the calculator screen
  const [displayValue, setDisplayValue] = useState<string>('0');
  // State for the first operand in a calculation
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  // State for the selected mathematical operator
  const [operator, setOperator] = useState<Operator>(null);
  // State to determine if the next digit input should start a new number
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);

  // Ref to track if the calculator is in an error state (e.g., division by zero)
  const errorRef = useRef<boolean>(false);

  // Resets all calculator state to initial values
  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    errorRef.current = false;
  }, []);

  // Handles input of a digit (0-9)
  const inputDigit = useCallback((digit: string) => {
    if (errorRef.current) {
      clearAll(); // Clear error before accepting new input
    }
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(prev => (prev === '0' || prev === '-0' ? digit : prev + digit));
    }
  }, [waitingForSecondOperand, clearAll]);

  // Handles input of a decimal point
  const inputDecimal = useCallback(() => {
    if (errorRef.current) {
      clearAll(); // Clear error before accepting new input
    }
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(prev => prev + '.');
    }
  }, [displayValue, waitingForSecondOperand, clearAll]);

  // Performs the actual calculation
  const performCalculation = useCallback((op1: number, op2: number, op: Operator): number | 'Error' => {
    if (op === '+') return op1 + op2;
    if (op === '-') return op1 - op2;
    if (op === '*') return op1 * op2;
    if (op === '/') {
      if (op2 === 0) return 'Error'; // Handle division by zero
      return op1 / op2;
    }
    return op2; // Fallback, should not be reached if operator is valid
  }, []);

  // Handles operator buttons (+, -, *, /)
  const handleOperator = useCallback((nextOperator: Operator) => {
    if (errorRef.current) return; // Do nothing if in error state

    const inputValue = parseFloat(displayValue);

    if (firstOperand === null && !isNaN(inputValue)) {
      setFirstOperand(inputValue);
    } else if (operator && firstOperand !== null && !waitingForSecondOperand) {
      // If there's a pending operation and a second operand is ready, calculate first
      const result = performCalculation(firstOperand, inputValue, operator);
      if (result === 'Error') {
        setDisplayValue('Error');
        errorRef.current = true;
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
        return;
      }
      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  }, [displayValue, firstOperand, operator, waitingForSecondOperand, performCalculation]);

  // Handles the equals button
  const equals = useCallback(() => {
    if (errorRef.current) return;
    if (firstOperand === null || operator === null) {
      return; // No pending operation to perform
    }

    const inputValue = parseFloat(displayValue);
    if (isNaN(inputValue)) {
      // If display value is invalid (e.g., just "."), do nothing
      return;
    }

    const result = performCalculation(firstOperand, inputValue, operator);

    if (result === 'Error') {
      setDisplayValue('Error');
      errorRef.current = true;
    } else {
      setDisplayValue(String(result));
    }

    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  }, [displayValue, firstOperand, operator, performCalculation]);

  // Deletes the last digit from the display
  const deleteLastDigit = useCallback(() => {
    if (errorRef.current) {
      clearAll();
      return;
    }
    if (waitingForSecondOperand) return; // Don't delete if waiting for new input

    setDisplayValue(prev => {
      if (prev.length === 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [waitingForSecondOperand, clearAll]);

  // Toggles the sign of the current display value
  const toggleSign = useCallback(() => {
    if (errorRef.current) {
      clearAll();
      return;
    }
    setDisplayValue(prev => String(parseFloat(prev) * -1));
  }, [clearAll]);

  // Effect for keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        handleOperator(key as Operator);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Prevent default form submission behavior
        equals();
      } else if (key === 'Backspace') {
        deleteLastDigit();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputDigit, inputDecimal, handleOperator, equals, deleteLastDigit, clearAll]);

  // Definition for calculator buttons and their properties
  const calculatorButtons = [
    { label: 'C', className: 'col-span-1 bg-gradient-to-br from-red-500 to-red-700 text-white', onClick: clearAll },
    { label: 'DEL', className: 'col-span-1 bg-gradient-to-br from-orange-400 to-orange-600 text-white', onClick: deleteLastDigit },
    { label: '+/-', className: 'col-span-1 bg-gradient-to-br from-orange-400 to-orange-600 text-white', onClick: toggleSign },
    { label: '/', className: 'col-span-1 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white', onClick: () => handleOperator('/') },

    { label: '7', className: 'col-span-1', onClick: () => inputDigit('7') },
    { label: '8', className: 'col-span-1', onClick: () => inputDigit('8') },
    { label: '9', className: 'col-span-1', onClick: () => inputDigit('9') },
    { label: '*', className: 'col-span-1 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white', onClick: () => handleOperator('*') },

    { label: '4', className: 'col-span-1', onClick: () => inputDigit('4') },
    { label: '5', className: 'col-span-1', onClick: () => inputDigit('5') },
    { label: '6', className: 'col-span-1', onClick: () => inputDigit('6') },
    { label: '-', className: 'col-span-1 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white', onClick: () => handleOperator('-') },

    { label: '1', className: 'col-span-1', onClick: () => inputDigit('1') },
    { label: '2', className: 'col-span-1', onClick: () => inputDigit('2') },
    { label: '3', className: 'col-span-1', onClick: () => inputDigit('3') },
    { label: '+', className: 'col-span-1 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white', onClick: () => handleOperator('+') },

    { label: '0', className: 'col-span-2', onClick: () => inputDigit('0') },
    { label: '.', className: 'col-span-1', onClick: inputDecimal },
    { label: '=', className: 'col-span-1 bg-gradient-to-br from-green-500 to-green-700 text-white', onClick: equals },
  ];

  // Base Tailwind CSS classes for all calculator buttons
  const buttonBaseClass = "flex items-center justify-center p-4 rounded-xl text-3xl font-semibold transition-all duration-200 ease-in-out shadow-lg transform active:scale-95 cursor-pointer select-none ";
  const numberButtonThemeClass = "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-50 hover:from-gray-600 hover:to-gray-700 ";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900 text-white p-4">
      <div className="w-full max-w-sm mx-auto p-6 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-3xl shadow-2xl border border-zinc-700 flex flex-col gap-6">
        {/* Calculator Display */}
        <div className="relative h-28 flex items-end justify-end p-4 bg-zinc-900 rounded-2xl shadow-inner-xl border border-zinc-700 overflow-hidden">
          <p className={`text-6xl font-light text-right leading-none ${displayValue.length > 9 ? 'text-4xl' : ''} ${displayValue.length > 12 ? 'text-3xl' : ''}`}>
            {displayValue}
          </p>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-4">
          {calculatorButtons.map((button, index) => (
            <div
              key={index}
              className={`${buttonBaseClass} ${button.className.includes('bg-gradient') ? button.className : numberButtonThemeClass + button.className}`}
              onClick={button.onClick}
            >
              {button.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}