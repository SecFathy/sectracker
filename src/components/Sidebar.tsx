
import React from 'react';
import { Shield, Bug, CheckSquare, Lightbulb, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { Sidebar as SidebarUI, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: BarChart3 },
  { id: 'platforms', title: 'Platforms & Bugs', icon: Bug },
  { id: 'checklists', title: 'Security Checklists', icon: CheckSquare },
  { id: 'tips', title: 'Tips & Tricks', icon: Lightbulb },
  { id: 'reading', title: 'Reading List', icon: BookOpen },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SidebarUI className="border-r border-gray-700 bg-gray-900">
      <SidebarHeader className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white">SecTracker</h1>
            <p className="text-sm text-gray-400">Bug Hunter Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    className={`w-full justify-start transition-colors ${
                      activeView === item.id 
                        ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-700">
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </SidebarUI>
  );
}
