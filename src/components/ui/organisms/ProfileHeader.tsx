'use client';

import React from 'react';
import { Card } from '../molecules/Card'; // Updated import path
import { Camera, Mail, MapPin, Globe } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  role?: string;
  location?: string;
  website?: string;
  bio?: string;
  avatar?: string;
}

export interface ProfileHeaderProps {
  user: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
      </div>
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 -mt-10">
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-zinc-100 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-zinc-500">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
              <Camera size={20} />
            </button>
          </div>
          
          <div className="flex-1 pt-12 sm:pt-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-4">
              <div className="space-y-1">
                <div>
                  <h2 className="font-bold text-2xl leading-none">{user.name}</h2>
                  {user.role && <p className="text-zinc-500 font-medium">{user.role}</p>}
                </div>
                {user.bio && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 text-sm text-zinc-600 dark:text-zinc-400 sm:pt-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Mail size={14} />
                  <span>{user.email}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={14} />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                      Site web
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
