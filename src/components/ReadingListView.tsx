import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, ExternalLink, CheckSquare, Clock, Search, Filter } from 'lucide-react';
import { ReadingModal } from '@/components/ReadingModal';

interface ReadingItem {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  dateAdded: string;
  read: boolean;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export function ReadingListView() {
  const [readingList, setReadingList] = useState<ReadingItem[]>([
    {
      id: '1',
      title: 'Advanced XSS Techniques in Modern Web Applications',
      url: 'https://example.com/advanced-xss',
      description: 'A comprehensive guide covering DOM-based XSS, CSP bypasses, and modern framework vulnerabilities.',
      tags: ['xss', 'dom', 'csp'],
      dateAdded: '2024-01-15',
      read: false,
      priority: 'High',
      category: 'Web Security'
    },
    {
      id: '2',
      title: 'SQL Injection in GraphQL Applications',
      url: 'https://example.com/graphql-sqli',
      description: 'Exploring SQL injection vulnerabilities in GraphQL endpoints and query structures.',
      tags: ['sqli', 'graphql', 'api'],
      dateAdded: '2024-01-12',
      read: true,
      priority: 'Medium',
      category: 'API Security'
    },
    {
      id: '3',
      title: 'Mobile App Security: Static vs Dynamic Analysis',
      url: 'https://example.com/mobile-security',
      description: 'Comparing SAST and DAST approaches for mobile application security testing.',
      tags: ['mobile', 'sast', 'dast'],
      dateAdded: '2024-01-10',
      read: false,
      priority: 'High',
      category: 'Mobile Security'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: ''
  });

  // Get unique categories and tags for filters
  const uniqueCategories = [...new Set(readingList.map(item => item.category))];
  const uniqueTags = [...new Set(readingList.flatMap(item => item.tags))];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const toggleRead = (id: string) => {
    setReadingList(readingList.map(item =>
      item.id === id ? { ...item, read: !item.read } : item
    ));
  };

  const filteredItems = readingList.filter(item => {
    // Status filter
    if (filter === 'read' && !item.read) return false;
    if (filter === 'unread' && item.read) return false;
    
    // Category filter
    if (filters.category && item.category !== filters.category) return false;
    
    // Tag filter
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(searchLower);
      const matchesDescription = item.description.toLowerCase().includes(searchLower);
      const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchLower));
      const matchesCategory = item.category.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription && !matchesTags && !matchesCategory) {
        return false;
      }
    }
    
    return true;
  });

  const unreadCount = readingList.filter(item => !item.read).length;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Search</span>
              </div>
              <Input
                placeholder="Search title, description, tags..."
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
                  <SelectItem value="">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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
                  <SelectItem value="">All Tags</SelectItem>
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(filters.search || filters.category || filters.tag) && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Showing {filteredItems.length} of {readingList.length} articles
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters({ category: '', tag: '', search: '' })}
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
          <Card key={item.id} className={`bg-gray-800 border-gray-700 ${item.read ? 'opacity-75' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <span className={item.read ? 'line-through text-gray-400' : ''}>{item.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`${getPriorityColor(item.priority)} text-white`}>
                      {item.priority}
                    </Badge>
                    <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-gray-400">{item.dateAdded}</span>
                    {item.read && (
                      <Badge variant="outline" className="border-green-600 text-green-400">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    )}
                    {!item.read && (
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
                    {item.read ? 'Mark Unread' : 'Mark Read'}
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
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
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
          setReadingList([...readingList, { 
            ...article, 
            id: Date.now().toString(), 
            dateAdded: new Date().toISOString().split('T')[0],
            read: false 
          }]);
          setShowModal(false);
        }}
      />
    </div>
  );
}
