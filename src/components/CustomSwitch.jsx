import React, { useState } from "react";

export default function CustomSwitch() {
  const [isOn, setIsOn] = useState(false);

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isOn}
        onChange={() => setIsOn(!isOn)}
        className="sr-only peer"
      />

      <div
        className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${
          isOn ? "bg-[#06B6D4]" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
            isOn ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}
