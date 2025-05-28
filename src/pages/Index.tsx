
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { PlatformsView } from '@/components/PlatformsView';
import { ChecklistsView } from '@/components/ChecklistsView';
import { TipsView } from '@/components/TipsView';
import { ReadingListView } from '@/components/ReadingListView';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const [activeView, setActiveView] = React.useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'platforms':
        return <PlatformsView />;
      case 'checklists':
        return <ChecklistsView />;
      case 'tips':
        return <TipsView />;
      case 'reading':
        return <ReadingListView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
