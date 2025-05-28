
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface RSSFiltersProps {
  filters: {
    category: string;
    search: string;
  };
  setFilters: (filters: { category: string; search: string }) => void;
  uniqueCategories: string[];
  filteredCount: number;
  totalCount: number;
}

export function RSSFilters({ 
  filters, 
  setFilters, 
  uniqueCategories, 
  filteredCount, 
  totalCount 
}: RSSFiltersProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-white font-medium">Filters</span>
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
              placeholder="Search articles..."
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
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {(filters.search || filters.category !== 'all') && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Showing {filteredCount} of {totalCount} articles
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilters({ category: 'all', search: '' })}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
