
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from '@/hooks/use-toast';

interface PersonalNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function PersonalNotesView() {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showNewNote, setShowNewNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data, error } = await supabase
      .from('personal_notes')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive"
      });
    } else {
      setNotes(data || []);
    }
  };

  const saveNote = async (note: Partial<PersonalNote>) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    if (note.id) {
      const { error } = await supabase
        .from('personal_notes')
        .update({
          title: note.title,
          content: note.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update note",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Note updated successfully"
        });
        fetchNotes();
        setEditingNote(null);
      }
    } else {
      const { error } = await supabase
        .from('personal_notes')
        .insert({
          title: note.title,
          content: note.content,
          user_id: user.data.user.id
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create note",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Note created successfully"
        });
        fetchNotes();
        setNewNote({ title: '', content: '' });
        setShowNewNote(false);
      }
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('personal_notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
      fetchNotes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Personal Notes</h1>
        <Button 
          onClick={() => setShowNewNote(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {showNewNote && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Textarea
              placeholder="Write your note in markdown..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="bg-gray-900 border-gray-600 text-white min-h-[200px]"
            />
            <div className="flex space-x-2">
              <Button onClick={() => saveNote(newNote)} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowNewNote(false)} variant="outline" className="border-gray-600">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {editingNote === note.id ? (
                    <Input
                      value={note.title}
                      onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n))}
                      className="bg-gray-900 border-gray-600 text-white"
                    />
                  ) : (
                    note.title || 'Untitled'
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  {editingNote === note.id ? (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => saveNote(note)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNote(null)}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNote(note.id)}
                        className="border-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNote(note.id)}
                        className="border-gray-600 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingNote === note.id ? (
                <Textarea
                  value={note.content}
                  onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, content: e.target.value } : n))}
                  className="bg-gray-900 border-gray-600 text-white min-h-[200px]"
                />
              ) : (
                <MarkdownRenderer content={note.content} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && !showNewNote && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <p className="text-gray-400">No notes yet. Create your first note!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
