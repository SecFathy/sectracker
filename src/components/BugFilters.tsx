
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface BugFiltersProps {
  filters: {
    severity: string;
    status: string;
    vulnerabilityType: string;
    search: string;
  };
  onFiltersChange: (filters: {
    severity: string;
    status: string;
    vulnerabilityType: string;
    search: string;
  }) => void;
}

export function BugFilters({ filters, onFiltersChange }: BugFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">Filters</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search bugs..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div>
          <Select value={filters.severity} onValueChange={(value) => updateFilter('severity', value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Informational">Informational</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Triaged">Triaged</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Bounty Awarded">Bounty Awarded</SelectItem>
              <SelectItem value="Duplicate">Duplicate</SelectItem>
              <SelectItem value="Not Applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Input
            placeholder="Vulnerability Type"
            value={filters.vulnerabilityType}
            onChange={(e) => updateFilter('vulnerabilityType', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>
    </div>
  );
}
