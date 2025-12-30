'use client';

import { useState } from 'react';
import { createDeckAction } from '@/actions/deck-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2 } from 'lucide-react';

interface CreateDeckModalProps {
  children: React.ReactNode;
}

export function CreateDeckModal({ children }: CreateDeckModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setValidationErrors([]);

    // Extract and validate data
    const deckData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      isPublic: formData.get('isPublic') === 'on',
    };

    try {
      // Call server action
      const result = await createDeckAction(deckData);
      
      if (result.success) {
        // Reset form and close modal
        setOpen(false);
        // Form will reset automatically when modal closes
      } else {
        if (result.details) {
          setValidationErrors(result.details);
        } else {
          setError(result.error || 'Failed to create deck');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Create deck error:', err);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Deck
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Create a new flashcard deck to organize your learning materials.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter deck title..."
              required
              disabled={isPending}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
            />
            {validationErrors.find(e => e.path.includes('title')) && (
              <p className="text-red-400 text-sm">
                {validationErrors.find(e => e.path.includes('title'))?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a brief description (optional)..."
              disabled={isPending}
              rows={3}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 resize-none"
            />
            {validationErrors.find(e => e.path.includes('description')) && (
              <p className="text-red-400 text-sm">
                {validationErrors.find(e => e.path.includes('description'))?.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              disabled={isPending}
              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isPublic" className="text-white text-sm">
              Make this deck public
            </Label>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Beta
            </Badge>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 rounded-md p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Deck'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
