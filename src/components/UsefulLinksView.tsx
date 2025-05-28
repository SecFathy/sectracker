import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ExternalLink, Edit2, Trash2, Save, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsefulLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  created_at: string;
}

interface LinkCategory {
  id: string;
  name: string;
}

export function UsefulLinksView() {
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [categories, setCategories] = useState<LinkCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewLink, setShowNewLink] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '', category: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchLinks();
  }, []);

  const fetchCategories = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data, error } = await supabase
      .from('link_categories')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('name');

    if (!error) {
      setCategories(data || []);
    }
  };

  const fetchLinks = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data, error } = await supabase
      .from('useful_links')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch links",
        variant: "destructive"
      });
    } else {
      setLinks(data || []);
    }
  };

  const saveLink = async (link: Partial<UsefulLink>) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    if (link.id) {
      const { error } = await supabase
        .from('useful_links')
        .update({
          title: link.title,
          url: link.url,
          description: link.description,
          category: link.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', link.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update link",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Link updated successfully"
        });
        fetchLinks();
        setEditingLink(null);
      }
    } else {
      const { error } = await supabase
        .from('useful_links')
        .insert({
          title: link.title,
          url: link.url,
          description: link.description,
          category: link.category,
          user_id: user.data.user.id
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create link",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Link created successfully"
        });
        fetchLinks();
        setNewLink({ title: '', url: '', description: '', category: '' });
        setShowNewLink(false);
      }
    }
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('useful_links')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Link deleted successfully"
      });
      fetchLinks();
    }
  };

  const createCategory = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user || !newCategoryName.trim()) return;

    const { error } = await supabase
      .from('link_categories')
      .insert({
        name: newCategoryName.trim(),
        user_id: user.data.user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Category created successfully"
      });
      fetchCategories();
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const filteredLinks = selectedCategory === 'all' 
    ? links 
    : links.filter(link => link.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Useful Links</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowNewCategory(true)}
            variant="outline"
            className="border-gray-600"
          >
            <Tag className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button 
            onClick={() => setShowNewLink(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showNewCategory && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <div className="flex space-x-2">
              <Button onClick={createCategory} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowNewCategory(false)} variant="outline" className="border-gray-600">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showNewLink && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">New Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Link title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Input
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              className="bg-gray-900 border-gray-600 text-white"
            />
            <Select value={newLink.category} onValueChange={(value) => setNewLink({ ...newLink, category: value })}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button onClick={() => saveLink(newLink)} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowNewLink(false)} variant="outline" className="border-gray-600">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLinks.map((link) => (
          <Card key={link.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{link.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingLink(link.id)}
                    className="border-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => deleteLink(link.id)}
                    className="border-gray-600 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  {link.category}
                </span>
                <Button
                  size="sm"
                  onClick={() => window.open(link.url, '_blank')}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">{link.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLinks.length === 0 && !showNewLink && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <p className="text-gray-400">No links found. Add your first useful link!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
