import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Bug, Eye, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { BugReportModal } from './BugReportModal';

interface BugReport {
  id: string;
  title: string;
  platform: string;
  program: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Submitted' | 'Accepted' | 'Resolved' | 'Duplicate';
  createdAt: string;
  bounty?: number;
}

export function BugReportsView() {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<BugReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Mock data
  useEffect(() => {
    setReports([
      {
        id: '1',
        title: 'XSS in user profile',
        platform: 'HackerOne',
        program: 'Uber',
        severity: 'High',
        status: 'Accepted',
        createdAt: '2024-01-15',
        bounty: 500
      },
      {
        id: '2',
        title: 'SQL Injection in search',
        platform: 'Bugcrowd',
        program: 'Shopify',
        severity: 'Critical',
        status: 'Resolved',
        createdAt: '2024-01-10',
        bounty: 1500
      }
    ]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return isHackerTheme ? 'bg-red-900 text-red-300' : 'bg-red-600';
      case 'High': return isHackerTheme ? 'bg-orange-900 text-orange-300' : 'bg-orange-500';
      case 'Medium': return isHackerTheme ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-500';
      case 'Low': return isHackerTheme ? 'bg-green-900 text-green-300' : 'bg-green-500';
      default: return isHackerTheme ? 'bg-gray-900 text-gray-300' : 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return isHackerTheme ? 'bg-green-900 text-green-300' : 'bg-green-600';
      case 'Accepted': return isHackerTheme ? 'bg-blue-900 text-blue-300' : 'bg-blue-600';
      case 'Submitted': return isHackerTheme ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-600';
      case 'Draft': return isHackerTheme ? 'bg-gray-900 text-gray-300' : 'bg-gray-600';
      case 'Duplicate': return isHackerTheme ? 'bg-purple-900 text-purple-300' : 'bg-purple-600';
      default: return isHackerTheme ? 'bg-gray-900 text-gray-300' : 'bg-gray-600';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = !filterProgram || filterProgram === 'all' || report.program === filterProgram;
    const matchesStatus = !filterStatus || filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const uniquePrograms = [...new Set(reports.map(r => r.program))];

  const handleSaveReport = (report: any) => {
    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? { ...report, id: editingReport.id } : r));
    } else {
      setReports([...reports, { ...report, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleEditReport = (report: BugReport) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
          My Bug Reports
        </h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700"}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Filters */}
      <Card className={isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${isHackerTheme ? "text-green-400" : "text-gray-400"}`} />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono placeholder:text-green-600" : "bg-gray-700 border-gray-600 text-white"}`}
              />
            </div>
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono" : "bg-gray-700 border-gray-600"}>
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent className={isHackerTheme ? "bg-black border-green-600 text-green-400 font-mono" : "bg-gray-700 border-gray-600"}>
                <SelectItem value="all">All Programs</SelectItem>
                {uniquePrograms.map(program => (
                  <SelectItem key={program} value={program}>{program}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className={isHackerTheme ? "bg-green-950 border-green-600 text-green-400 font-mono" : "bg-gray-700 border-gray-600"}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className={isHackerTheme ? "bg-black border-green-600 text-green-400 font-mono" : "bg-gray-700 border-gray-600"}>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterProgram('');
                setFilterStatus('');
              }}
              className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className={isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bug className={`h-4 w-4 ${isHackerTheme ? "text-green-400" : "text-blue-400"}`} />
                    <h3 className={`font-medium ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                      {report.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                      {report.platform} • {report.program}
                    </span>
                    <span className={isHackerTheme ? "text-green-500 font-mono" : "text-gray-400"}>
                      {report.createdAt}
                    </span>
                    {report.bounty && (
                      <span className={`font-medium ${isHackerTheme ? "text-green-400 font-mono" : "text-green-400"}`}>
                        ${report.bounty}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(report.severity)}>
                    {report.severity}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditReport(report)}
                      className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteReport(report.id)}
                      className={isHackerTheme ? "border-red-600 text-red-400 hover:bg-red-950" : "border-red-600 text-red-400 hover:bg-red-700"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className={isHackerTheme ? "bg-black border-green-600" : "bg-gray-800 border-gray-700"}>
          <CardContent className="p-8 text-center">
            <Bug className={`h-12 w-12 mx-auto mb-4 ${isHackerTheme ? "text-green-600" : "text-gray-400"}`} />
            <p className={`text-lg ${isHackerTheme ? "text-green-400 font-mono" : "text-gray-400"}`}>
              No bug reports found
            </p>
            <p className={`text-sm mt-2 ${isHackerTheme ? "text-green-600 font-mono" : "text-gray-500"}`}>
              Create your first bug report to get started
            </p>
          </CardContent>
        </Card>
      )}

      <BugReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveReport}
        editingReport={editingReport}
      />
    </div>
  );
}
