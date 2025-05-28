
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, ExternalLink, CheckSquare, Clock, Search, Filter } from 'lucide-react';
import { ReadingModal } from '@/components/ReadingModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReadingItem {
  id: string;
  title: string;
  url: string;
  description: string;
  tags?: string[];
  created_at: string;
  is_read: boolean;
  priority: number;
  category: string;
}

export function ReadingListView() {
  const [readingList, setReadingList] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [filters, setFilters] = useState({
    category: 'all',
    tag: 'all',
    search: ''
  });
  const { toast } = useToast();

  const fetchReadingList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reading_list')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reading list:', error);
        return;
      }

      const formattedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        description: item.description || '',
        tags: [], // We don't have tags in the database schema yet
        created_at: item.created_at,
        is_read: item.is_read || false,
        priority: item.priority || 1,
        category: item.category || 'Uncategorized'
      })) || [];

      setReadingList(formattedData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingList();
  }, []);

  // Get unique categories for filters
  const uniqueCategories = [...new Set(readingList.map(item => item.category))].filter(Boolean);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-600';
      case 2: return 'bg-yellow-600';
      case 1: return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Low';
    }
  };

  const toggleRead = async (id: string) => {
    try {
      const item = readingList.find(item => item.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('reading_list')
        .update({ is_read: !item.is_read })
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update reading status",
          variant: "destructive"
        });
        return;
      }

      setReadingList(readingList.map(item =>
        item.id === id ? { ...item, is_read: !item.is_read } : item
      ));
    } catch (error) {
      console.error('Error toggling read status:', error);
      toast({
        title: "Error",
        description: "Failed to update reading status",
        variant: "destructive"
      });
    }
  };

  const addNewArticle = async (articleData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const priorityValue = articleData.priority === 'High' ? 3 : 
                           articleData.priority === 'Medium' ? 2 : 1;

      const { data, error } = await supabase
        .from('reading_list')
        .insert([{
          user_id: user.id,
          title: articleData.title,
          url: articleData.url,
          description: articleData.description,
          category: 'Manual',
          priority: priorityValue
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add article",
          variant: "destructive"
        });
        return;
      }

      const newItem: ReadingItem = {
        id: data.id,
        title: data.title,
        url: data.url,
        description: data.description || '',
        tags: [],
        created_at: data.created_at,
        is_read: false,
        priority: data.priority,
        category: data.category || 'Manual'
      };

      setReadingList([newItem, ...readingList]);
      toast({
        title: "Success",
        description: "Article added to reading list"
      });
    } catch (error) {
      console.error('Error adding article:', error);
      toast({
        title: "Error",
        description: "Failed to add article",
        variant: "destructive"
      });
    }
  };

  const filteredItems = readingList.filter(item => {
    // Status filter
    if (filter === 'read' && !item.is_read) return false;
    if (filter === 'unread' && item.is_read) return false;
    
    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(searchLower);
      const matchesDescription = item.description.toLowerCase().includes(searchLower);
      const matchesCategory = item.category.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false;
      }
    }
    
    return true;
  });

  const unreadCount = readingList.filter(item => !item.is_read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Reading List</h1>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reading List</h1>
          <p className="text-gray-400 mt-1">{unreadCount} unread articles</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Article
        </Button>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
        >
          All ({readingList.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className={filter === 'unread' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'default' : 'outline'}
          onClick={() => setFilter('read')}
          className={filter === 'read' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
        >
          Read ({readingList.length - unreadCount})
        </Button>
      </div>

      {/* Advanced Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-white font-medium">Search & Filters</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Search</span>
              </div>
              <Input
                placeholder="Search title, description..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Category</div>
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
          </div>
          
          {(filters.search || filters.category !== 'all') && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Showing {filteredItems.length} of {readingList.length} articles
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

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`bg-gray-800 border-gray-700 ${item.is_read ? 'opacity-75' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <span className={item.is_read ? 'line-through text-gray-400' : ''}>{item.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`${getPriorityColor(item.priority)} text-white`}>
                      {getPriorityLabel(item.priority)}
                    </Badge>
                    <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {item.is_read && (
                      <Badge variant="outline" className="border-green-600 text-green-400">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    )}
                    {!item.is_read && (
                      <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Unread
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleRead(item.id)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {item.is_read ? 'Mark Unread' : 'Mark Read'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(item.url, '_blank')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-3">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {readingList.length === 0 ? "No articles yet. Add your first article to read!" : "No articles match the current filters."}
          </p>
        </div>
      )}

      <ReadingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={(article) => {
          addNewArticle(article);
          setShowModal(false);
        }}
      />
    </div>
  );
}
