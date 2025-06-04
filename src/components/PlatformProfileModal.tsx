
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlatformProfileModalProps } from '@/types/platform';
import { PlatformProfileForm } from './PlatformProfileForm';

export function PlatformProfileModal({ isOpen, onClose, platforms, onSave }: PlatformProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add Platform Profile</DialogTitle>
        </DialogHeader>
        <PlatformProfileForm
          platforms={platforms}
          onSave={onSave}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
