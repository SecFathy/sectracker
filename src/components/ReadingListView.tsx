
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, ExternalLink, CheckSquare, Clock } from 'lucide-react';
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
      priority: 'High'
    },
    {
      id: '2',
      title: 'SQL Injection in GraphQL Applications',
      url: 'https://example.com/graphql-sqli',
      description: 'Exploring SQL injection vulnerabilities in GraphQL endpoints and query structures.',
      tags: ['sqli', 'graphql', 'api'],
      dateAdded: '2024-01-12',
      read: true,
      priority: 'Medium'
    },
    {
      id: '3',
      title: 'Mobile App Security: Static vs Dynamic Analysis',
      url: 'https://example.com/mobile-security',
      description: 'Comparing SAST and DAST approaches for mobile application security testing.',
      tags: ['mobile', 'sast', 'dast'],
      dateAdded: '2024-01-10',
      read: false,
      priority: 'High'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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
    if (filter === 'read') return item.read;
    if (filter === 'unread') return !item.read;
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
