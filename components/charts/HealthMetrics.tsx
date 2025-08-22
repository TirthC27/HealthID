'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { TrendingUp, TrendingDown, Activity, Heart, Droplets, Thermometer } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  change?: number;
  target?: string;
  color: string;
  icon: React.ReactNode;
  progress?: number;
}

function MetricCard({ title, value, unit, change, target, color, icon, progress }: MetricCardProps) {
  const isPositive = change ? change > 0 : false;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className={`${color} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <span className="text-sm font-medium opacity-90">{title}</span>
            </div>
            {change && (
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-xs">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          
          {target && (
            <p className="text-xs text-gray-500 mt-1">Target: {target}</p>
          )}
          
          {progress !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${color.replace('bg-', 'bg-opacity-80 bg-')}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress}% of target</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Heart Rate"
        value="95"
        unit="bpm"
        change={-2}
        target="60-100 bpm"
        color="bg-red-500"
        icon={<Heart className="w-5 h-5" />}
        progress={75}
      />
      
      <MetricCard
        title="Blood Pressure"
        value="120/80"
        unit="mmHg"
        change={3}
        target="<140/90"
        color="bg-blue-500"
        icon={<Activity className="w-5 h-5" />}
        progress={85}
      />
      
      <MetricCard
        title="Hydration"
        value="2.5"
        unit="L"
        change={12}
        target="3.1L"
        color="bg-cyan-500"
        icon={<Droplets className="w-5 h-5" />}
        progress={81}
      />
      
      <MetricCard
        title="Temperature"
        value="98.6"
        unit="°F"
        change={0}
        target="98.6°F"
        color="bg-orange-500"
        icon={<Thermometer className="w-5 h-5" />}
        progress={100}
      />
    </div>
  );
}

export function DoctorMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Patients Today"
        value="12"
        change={8}
        target="15 target"
        color="bg-emerald-500"
        icon={<Activity className="w-5 h-5" />}
        progress={80}
      />
      
      <MetricCard
        title="Prescriptions"
        value="28"
        change={15}
        target="30 avg"
        color="bg-purple-500"
        icon={<Heart className="w-5 h-5" />}
        progress={93}
      />
      
      <MetricCard
        title="Consultations"
        value="8"
        change={-5}
        target="10 target"
        color="bg-indigo-500"
        icon={<Activity className="w-5 h-5" />}
        progress={80}
      />
      
      <MetricCard
        title="Avg. Session"
        value="25"
        unit="min"
        change={2}
        target="20-30 min"
        color="bg-teal-500"
        icon={<Thermometer className="w-5 h-5" />}
        progress={75}
      />
    </div>
  );
}
