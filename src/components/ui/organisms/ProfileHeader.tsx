'use client';

import React, { useRef, useState } from 'react';
import { Card } from '../molecules/Card';
import { Camera, Mail, MapPin, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

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
  userId?: string;
  onAvatarUpdated?: (url: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, userId, onAvatarUpdated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);

  const handleAvatarClick = () => {
    if (!userId) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image trop lourde (max 20 Mo)');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Upload en cours…');

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      await supabase.auth.updateUser({ data: { avatar_url: cacheBustedUrl } });
      await supabase.from('profiles').update({ avatar: cacheBustedUrl }).eq('id', userId);

      setAvatarUrl(cacheBustedUrl);
      onAvatarUpdated?.(cacheBustedUrl);
      toast.success('Photo de profil mise à jour', { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
      </div>
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 -mt-10">
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-zinc-100 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-zinc-500">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading || !userId}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
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
