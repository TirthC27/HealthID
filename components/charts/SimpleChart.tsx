'use client';

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export function SimpleBarChart({ data, title, height = 200 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-end space-x-4" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className={`w-full rounded-t-md ${item.color} transition-all duration-500`}
              style={{ 
                height: `${(item.value / maxValue) * (height - 50)}px`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-gray-600 mt-2 text-center">{item.label}</span>
            <span className="text-sm font-medium text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string;
}

export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3B82F6',
  label,
  value
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
          <span className="text-xs text-gray-500 text-center">{value}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700 mt-2">{label}</span>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  centerText?: string;
}

export function DonutChart({ data, title, centerText }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;
  
  const paths = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    
    cumulativePercentage += percentage;
    
    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    const d = [
      "M", start.x, start.y, 
      "A", 40, 40, 0, largeArcFlag, 0, end.x, end.y,
      "L", 50, 50,
      "Z"
    ].join(" ");
    
    return (
      <path
        key={index}
        d={d}
        fill={item.color}
        className="hover:opacity-80 transition-opacity"
      />
    );
  });
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E7EB" strokeWidth="20"/>
            {paths}
            <circle cx="50" cy="50" r="20" fill="white"/>
          </svg>
          {centerText && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-800">{centerText}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}
