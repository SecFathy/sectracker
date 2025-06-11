
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Lightbulb, Copy, Eye, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { TipModal } from '@/components/TipModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tip {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  created_at: string;
}

export function TipsView() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    tag: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('security_tips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tips:', error);
        toast({
          title: "Error",
          description: "Failed to fetch security tips",
          variant: "destructive"
        });
        return;
      }

      const formattedTips: Tip[] = data?.map(tip => ({
        id: tip.id,
        title: tip.title,
        category: tip.category || 'General',
        content: tip.content,
        tags: tip.tags || [],
        created_at: tip.created_at
      })) || [];

      setTips(formattedTips);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security tips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and tags for filters
  const uniqueCategories = [...new Set(tips.map(tip => tip.category))].filter(Boolean);
  const uniqueTags = [...new Set(tips.flatMap(tip => tip.tags))].filter(Boolean);

  const filteredTips = tips.filter(tip => {
    const matchesCategory = filters.category === 'all' || tip.category === filters.category;
    const matchesTag = filters.tag === 'all' || tip.tags.includes(filters.tag);
    const matchesSearch = !filters.search || 
      tip.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      tip.content.toLowerCase().includes(filters.search.toLowerCase()) ||
      tip.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesCategory && matchesTag && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'XSS': return 'bg-red-600';
      case 'SQL Injection': return 'bg-orange-600';
      case 'CSRF': return 'bg-yellow-600';
      case 'Authentication': return 'bg-green-600';
      case 'Authorization': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const handleSaveTip = async (tipData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTip) {
        const { error } = await supabase
          .from('security_tips')
          .update({
            title: tipData.title,
            category: tipData.category,
            content: tipData.content,
            tags: tipData.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTip.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Security tip updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('security_tips')
          .insert({
            user_id: user.id,
            title: tipData.title,
            category: tipData.category,
            content: tipData.content,
            tags: tipData.tags
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Security tip created successfully"
        });
      }

      fetchTips();
      setShowModal(false);
      setEditingTip(null);
    } catch (error) {
      console.error('Error saving tip:', error);
      toast({
        title: "Error",
        description: "Failed to save security tip",
        variant: "destructive"
      });
    }
  };

  const handleEditTip = (tip: Tip) => {
    setEditingTip(tip);
    setShowModal(true);
  };

  const handleDeleteTip = async (tipId: string) => {
    try {
      const { error } = await supabase
        .from('security_tips')
        .delete()
        .eq('id', tipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security tip deleted successfully"
      });

      fetchTips();
    } catch (error) {
      console.error('Error deleting tip:', error);
      toast({
        title: "Error",
        description: "Failed to delete security tip",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Tips & Tricks</h1>
        <div className="text-center py-8 text-gray-400">
          Loading security tips...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tips & Tricks</h1>
        <Button 
          onClick={() => {
            setEditingTip(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tip
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-white font-medium">Filters</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Search</span>
              </div>
              <Input
                placeholder="Search tips, tags, content..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Bug Type</div>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category || 'unknown'}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Tag</div>
              <Select value={filters.tag} onValueChange={(value) => setFilters({...filters, tag: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Tags</SelectItem>
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag || 'unknown'}>#{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(filters.search || filters.category !== 'all' || filters.tag !== 'all') && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Showing {filteredTips.length} of {tips.length} tips
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters({ category: 'all', tag: 'all', search: '' })}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTips.map((tip) => (
          <Card key={tip.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <span>{tip.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getCategoryColor(tip.category)} text-white`}>
                      {tip.category}
                    </Badge>
                    <span className="text-xs text-gray-400">{new Date(tip.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(tip.content)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTip(tip)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditTip(tip)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTip(tip.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <pre className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {tip.content.length > 200 ? `${tip.content.substring(0, 200)}...` : tip.content}
                </pre>
                <div className="flex flex-wrap gap-1">
                  {tip.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTips.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {tips.length === 0 ? "No tips yet. Add your first security tip!" : "No tips match the current filters."}
          </p>
        </div>
      )}

      <TipModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTip(null);
        }}
        onSave={handleSaveTip}
        tip={editingTip}
      />

      {selectedTip && (
        <TipModal
          isOpen={!!selectedTip}
          onClose={() => setSelectedTip(null)}
          tip={selectedTip}
          viewMode={true}
        />
      )}
    </div>
  );
}
