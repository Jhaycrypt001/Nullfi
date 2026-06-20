import React, { useState } from 'react';

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked = false,
  onChange,
  disabled = false,
  loading = false,
  label,
  id,
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    if (disabled || loading) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center gap-3">
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium transition-colors duration-300 ${
            isChecked ? 'text-white' : 'text-white/60'
          } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={isChecked}
        onClick={handleToggle}
        onMouseDown={() => !disabled && !loading && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled || loading}
        className={`
          relative h-7 w-12 rounded-full p-1 transition-all duration-500 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black
          ${isChecked ? 'bg-green-500/80' : 'bg-white/10'}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-90'}
        `}
      >
        {/* Glow effect */}
        <div
          className={`
            absolute inset-0 rounded-full transition-opacity duration-500
            ${isChecked ? 'opacity-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'opacity-0'}
          `}
        />

        {/* Track inner gradient */}
        <div
          className={`
            absolute inset-[2px] rounded-full transition-all duration-500
            ${isChecked ? 'bg-gradient-to-b from-green-500 to-green-600/90' : 'bg-transparent'}
          `}
        />

        {/* Thumb */}
        <div
          className={`
            relative h-5 w-5 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            bg-white
            ${isChecked ? 'translate-x-5' : 'translate-x-0'}
            ${isPressed && !disabled && !loading ? 'scale-90 duration-150' : ''}
          `}
        >
          {/* Thumb inner shine */}
          <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-white via-white to-gray-200/30" />

          {/* Thumb highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 via-transparent to-transparent" />

          {/* Status indicator dot */}
          <div
            className={`
              absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500
              ${
                isChecked
                  ? 'h-1.5 w-1.5 bg-green-500 opacity-100 scale-100'
                  : 'h-1 w-1 bg-gray-400/40 opacity-100 scale-100'
              }
            `}
          />

          {/* Loading spinner */}
          {loading && (
            <div className="absolute inset-0 rounded-full border-2 border-green-500/20 border-t-green-500 animate-spin" />
          )}

          {/* Ripple effect on toggle */}
          {isChecked && !loading && (
            <div
              className="absolute inset-0 rounded-full animate-ping bg-green-500/20 scale-150 opacity-0"
              key="on"
            />
          )}
        </div>
      </button>
    </div>
  );
};

export default ToggleSwitch;
