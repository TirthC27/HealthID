'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, User, Pill, FileText, Shield, Star } from 'lucide-react';

interface Activity {
  id: string;
  type: 'login' | 'record' | 'prescription' | 'consent' | 'appointment';
  title: string;
  description: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  color: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title: string;
  showPriority?: boolean;
}

export function ActivityFeed({ activities, title, showPriority = false }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'login':
        return <User className="w-4 h-4" />;
      case 'record':
        return <FileText className="w-4 h-4" />;
      case 'prescription':
        return <Pill className="w-4 h-4" />;
      case 'consent':
        return <Shield className="w-4 h-4" />;
      case 'appointment':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="secondary">{activities.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    {showPriority && activity.priority && (
                      <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sample data generators
export function generatePatientActivities(): Activity[] {
  return [
    {
      id: '1',
      type: 'record',
      title: 'Blood Test Results Added',
      description: 'Cholesterol levels and complete blood count results uploaded',
      time: '2 hours ago',
      priority: 'high',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: '2',
      type: 'consent',
      title: 'Access Granted',
      description: 'Dr. Smith now has access to your health records',
      time: '4 hours ago',
      priority: 'medium',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: '3',
      type: 'prescription',
      title: 'New Prescription',
      description: 'Amoxicillin 500mg prescribed for 7 days',
      time: '1 day ago',
      priority: 'high',
      icon: <Pill className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: '4',
      type: 'login',
      title: 'Account Access',
      description: 'Logged in from mobile device',
      time: '2 days ago',
      priority: 'low',
      icon: <User className="w-4 h-4" />,
      color: 'bg-gray-100 text-gray-600'
    }
  ];
}

export function generateDoctorActivities(): Activity[] {
  return [
    {
      id: '1',
      type: 'appointment',
      title: 'Consultation Completed',
      description: 'Patient John Doe - Routine checkup and prescription',
      time: '30 minutes ago',
      priority: 'medium',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: '2',
      type: 'prescription',
      title: 'Prescription Written',
      description: 'Prescribed antibiotics for Sarah Johnson',
      time: '1 hour ago',
      priority: 'high',
      icon: <Pill className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: '3',
      type: 'record',
      title: 'Patient Records Reviewed',
      description: 'Reviewed lab results for 3 patients',
      time: '2 hours ago',
      priority: 'medium',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: '4',
      type: 'consent',
      title: 'Access Request',
      description: 'New patient consent received',
      time: '3 hours ago',
      priority: 'low',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];
}
