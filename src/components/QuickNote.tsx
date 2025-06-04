
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function QuickNote() {
  const [content, setContent] = useState('');
  const [isLoading, setSaveLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuickNote();
  }, []);

  const loadQuickNote = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from('personal_notes')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('title', 'Quick Note')
      .maybeSingle();

    if (data) {
      setContent(data.content || '');
    }
  };

  const saveQuickNote = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    setSaveLoading(true);

    // Check if quick note already exists
    const { data: existingNote } = await supabase
      .from('personal_notes')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('title', 'Quick Note')
      .maybeSingle();

    let error;
    if (existingNote) {
      ({ error } = await supabase
        .from('personal_notes')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingNote.id));
    } else {
      ({ error } = await supabase
        .from('personal_notes')
        .insert({
          title: 'Quick Note',
          content: content,
          user_id: user.data.user.id
        }));
    }

    setSaveLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save quick note",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Quick note saved successfully"
      });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="h-5 w-5 mr-2 text-purple-400" />
          Quick Note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Jot down quick thoughts, ideas, or reminders..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-gray-900 border-gray-600 text-white min-h-[120px]"
        />
        <Button 
          onClick={saveQuickNote}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Note'}
        </Button>
      </CardContent>
    </Card>
  );
}
