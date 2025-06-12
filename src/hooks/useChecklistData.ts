
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order_index?: number;
}

interface Checklist {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'desktop' | 'api';
  items: ChecklistItem[];
  description?: string;
}

export function useChecklistData() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for development
  const mockChecklists: Checklist[] = [
    {
      id: '1',
      name: 'Web Application Security',
      type: 'web',
      description: 'Comprehensive security testing for web applications',
      items: [
        { id: '1', text: '**SQL Injection Testing**\n\nTest for SQL injection vulnerabilities in all input fields and parameters.', completed: true },
        { id: '2', text: '**Cross-Site Scripting (XSS)**\n\n- Test for Reflected XSS\n- Test for Stored XSS\n- Test for DOM-based XSS', completed: true },
        { id: '3', text: 'Test for CSRF vulnerabilities', completed: false },
        { id: '4', text: 'Check for insecure direct object references', completed: false },
        { id: '5', text: 'Test authentication bypass', completed: false },
        { id: '6', text: 'Check for session management issues', completed: false },
        { id: '7', text: 'Test for directory traversal', completed: false },
        { id: '8', text: 'Check for command injection', completed: false }
      ]
    },
    {
      id: '2',
      name: 'Mobile Application Security',
      type: 'mobile',
      description: 'Security testing checklist for mobile applications',
      items: [
        { id: '1', text: 'Test for insecure data storage', completed: false },
        { id: '2', text: 'Check for weak cryptography', completed: false },
        { id: '3', text: 'Test for insecure communication', completed: false },
        { id: '4', text: 'Check for improper platform usage', completed: false },
        { id: '5', text: 'Test for reverse engineering protection', completed: false }
      ]
    },
    {
      id: '3',
      name: 'API Security Testing',
      type: 'api',
      description: 'Security testing checklist for APIs',
      items: [
        { id: '1', text: 'Test authentication mechanisms', completed: false },
        { id: '2', text: 'Check authorization controls', completed: false },
        { id: '3', text: 'Test rate limiting', completed: false },
        { id: '4', text: 'Check input validation', completed: false },
        { id: '5', text: 'Test API versioning security', completed: false }
      ]
    }
  ];

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      
      // Try to get user first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // If user is authenticated, try to fetch from database
        const { data: checklistsData, error: checklistsError } = await supabase
          .from('security_checklists')
          .select(`
            id,
            name,
            checklist_type,
            description,
            checklist_items (
              id,
              text,
              is_completed,
              order_index
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (checklistsError) {
          console.error('Database error:', checklistsError);
          // Fall back to mock data
          setChecklists(mockChecklists);
        } else {
          // Transform database data to match our interface
          const dbChecklists = (checklistsData || []).map(checklist => ({
            id: checklist.id,
            name: checklist.name,
            type: checklist.checklist_type as 'web' | 'mobile' | 'desktop' | 'api',
            description: checklist.description,
            items: (checklist.checklist_items || [])
              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
              .map(item => ({
                id: item.id,
                text: item.text,
                completed: item.is_completed || false,
                order_index: item.order_index || 0
              }))
          }));
          
          // Combine database checklists with mock data
          setChecklists([...mockChecklists, ...dbChecklists]);
        }
      } else {
        // No user authenticated, use mock data
        setChecklists(mockChecklists);
      }
    } catch (error: any) {
      console.error('Error fetching checklists:', error);
      // Fall back to mock data
      setChecklists(mockChecklists);
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async (checklistData: Omit<Checklist, 'id' | 'items'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // In offline mode, create with mock ID
        const newChecklist: Checklist = {
          ...checklistData,
          id: Date.now().toString(),
          items: []
        };
        setChecklists(prev => [newChecklist, ...prev]);
        toast({
          title: "Success",
          description: "Checklist created successfully (offline mode)"
        });
        return;
      }

      const { data, error } = await supabase
        .from('security_checklists')
        .insert([{
          user_id: user.id,
          name: checklistData.name,
          checklist_type: checklistData.type,
          description: checklistData.description
        }])
        .select()
        .single();

      if (error) throw error;

      const newChecklist: Checklist = {
        id: data.id,
        name: data.name,
        type: data.checklist_type as 'web' | 'mobile' | 'desktop' | 'api',
        description: data.description,
        items: []
      };

      setChecklists(prev => [newChecklist, ...prev]);
      
      toast({
        title: "Success",
        description: "Checklist created successfully"
      });
    } catch (error: any) {
      console.error('Error creating checklist:', error);
      toast({
        title: "Error",
        description: "Failed to create checklist",
        variant: "destructive"
      });
    }
  };

  const updateChecklist = (updatedChecklist: Checklist) => {
    setChecklists(prev => 
      prev.map(checklist => 
        checklist.id === updatedChecklist.id ? {
          ...updatedChecklist,
          items: updatedChecklist.items || []
        } : checklist
      )
    );
  };

  const deleteChecklist = async (checklistId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('security_checklists')
          .delete()
          .eq('id', checklistId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting checklist:', error);
        }
      }

      setChecklists(prev => prev.filter(checklist => checklist.id !== checklistId));
      toast({
        title: "Success",
        description: "Checklist deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting checklist:', error);
      toast({
        title: "Error",
        description: "Failed to delete checklist",
        variant: "destructive"
      });
    }
  };

  const toggleChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      const item = checklist?.items.find(i => i.id === itemId);
      
      if (!item) return;

      const newCompletedState = !item.completed;

      // Update in database if possible
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('checklist_items')
          .update({ is_completed: newCompletedState })
          .eq('id', itemId);

        if (error) {
          console.error('Error updating checklist item:', error);
        }
      }

      // Update local state
      setChecklists(prev => 
        prev.map(checklist => 
          checklist.id === checklistId 
            ? {
                ...checklist,
                items: checklist.items.map(item =>
                  item.id === itemId ? { ...item, completed: newCompletedState } : item
                )
              }
            : checklist
        )
      );
    } catch (error: any) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const addChecklistItem = async (checklistId: string, text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let newItemId = Date.now().toString();
      
      if (user) {
        const { data, error } = await supabase
          .from('checklist_items')
          .insert([{
            text,
            checklist_id: checklistId,
            is_completed: false,
            order_index: Date.now()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error adding checklist item:', error);
        } else {
          newItemId = data.id;
        }
      }

      const newItem: ChecklistItem = {
        id: newItemId,
        text,
        completed: false
      };

      setChecklists(prev => 
        prev.map(checklist => 
          checklist.id === checklistId 
            ? { ...checklist, items: [...checklist.items, newItem] }
            : checklist
        )
      );

      toast({
        title: "Success",
        description: "Checklist item added successfully"
      });
    } catch (error: any) {
      console.error('Error adding checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to add checklist item",
        variant: "destructive"
      });
    }
  };

  const updateChecklistItem = async (checklistId: string, itemId: string, text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('checklist_items')
          .update({ text })
          .eq('id', itemId);

        if (error) {
          console.error('Error updating checklist item:', error);
        }
      }

      setChecklists(prev => 
        prev.map(checklist => 
          checklist.id === checklistId 
            ? {
                ...checklist,
                items: checklist.items.map(item =>
                  item.id === itemId ? { ...item, text } : item
                )
              }
            : checklist
        )
      );

      toast({
        title: "Success",
        description: "Checklist item updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to update checklist item",
        variant: "destructive"
      });
    }
  };

  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('checklist_items')
          .delete()
          .eq('id', itemId);

        if (error) {
          console.error('Error deleting checklist item:', error);
        }
      }

      setChecklists(prev => 
        prev.map(checklist => 
          checklist.id === checklistId 
            ? { ...checklist, items: checklist.items.filter(item => item.id !== itemId) }
            : checklist
        )
      );

      toast({
        title: "Success",
        description: "Checklist item deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to delete checklist item",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  return {
    checklists,
    loading,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    toggleChecklistItem,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    refetch: fetchChecklists
  };
}
