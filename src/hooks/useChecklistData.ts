
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
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
        const { data: checklistsData, error } = await supabase
          .from('security_checklists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Database error:', error);
          // Fall back to mock data
          setChecklists(mockChecklists);
        } else {
          // Combine database checklists with mock data for now
          const dbChecklists = (checklistsData || []).map(checklist => ({
            id: checklist.id,
            name: checklist.name,
            type: checklist.checklist_type as 'web' | 'mobile' | 'desktop' | 'api',
            description: checklist.description,
            items: [] // Will be populated when we implement checklist items properly
          }));
          
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

  const createChecklist = async (checklist: Omit<Checklist, 'id' | 'items'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // In offline mode, create with mock ID
        const newChecklist: Checklist = {
          ...checklist,
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
          name: checklist.name,
          checklist_type: checklist.type,
          description: checklist.description
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
        checklist.id === updatedChecklist.id ? updatedChecklist : checklist
      )
    );
  };

  const deleteChecklist = (checklistId: string) => {
    setChecklists(prev => prev.filter(checklist => checklist.id !== checklistId));
    toast({
      title: "Success",
      description: "Checklist deleted successfully"
    });
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => 
      prev.map(checklist => 
        checklist.id === checklistId 
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              )
            }
          : checklist
      )
    );
  };

  const addChecklistItem = (checklistId: string, text: string) => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
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
  };

  const updateChecklistItem = (checklistId: string, itemId: string, text: string) => {
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
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => 
      prev.map(checklist => 
        checklist.id === checklistId 
          ? { ...checklist, items: checklist.items.filter(item => item.id !== itemId) }
          : checklist
      )
    );
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
