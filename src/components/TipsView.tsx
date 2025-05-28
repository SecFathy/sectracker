
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Copy, Eye } from 'lucide-react';
import { TipModal } from '@/components/TipModal';

interface Tip {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  dateAdded: string;
}

export function TipsView() {
  const [tips, setTips] = useState<Tip[]>([
    {
      id: '1',
      title: 'XSS in AngularJS Applications',
      category: 'XSS',
      content: `When testing AngularJS applications, try these payloads:
{{constructor.constructor('alert(1)')()}}
{{$on.constructor('alert(1)')()}}
{{[].pop.constructor('alert(1)')()}}

These work because AngularJS evaluates expressions in the template context.`,
      tags: ['xss', 'angularjs', 'javascript'],
      dateAdded: '2024-01-15'
    },
    {
      id: '2',
      title: 'SQL Injection Bypass Techniques',
      category: 'SQL Injection',
      content: `Common WAF bypass techniques:
- Use /**/ instead of spaces: SELECT/**/password/**/FROM/**/users
- Unicode normalization: ﹪27UNION﹪27 
- Case variation: UnIoN SeLeCt
- Inline comments: SELECT/*comment*/password/**/FROM/**/users`,
      tags: ['sqli', 'waf-bypass', 'database'],
      dateAdded: '2024-01-10'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tips & Tricks</h1>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tip
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tips.map((tip) => (
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
                    <span className="text-xs text-gray-400">{tip.dateAdded}</span>
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

      <TipModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={(tip) => {
          setTips([...tips, { ...tip, id: Date.now().toString(), dateAdded: new Date().toISOString().split('T')[0] }]);
          setShowModal(false);
        }}
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
