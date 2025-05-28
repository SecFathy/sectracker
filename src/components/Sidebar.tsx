
import React from 'react';
import { Shield, Bug, CheckSquare, Lightbulb, BookOpen, BarChart3, LogOut, FileText, Link, User, Rss } from 'lucide-react';
import { Sidebar as SidebarUI, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: BarChart3, color: 'text-cyan-400' },
  { id: 'platforms', title: 'Platforms & Bugs', icon: Bug, color: 'text-red-400' },
  { id: 'checklists', title: 'Security Checklists', icon: CheckSquare, color: 'text-green-400' },
  { id: 'tips', title: 'Tips & Tricks', icon: Lightbulb, color: 'text-yellow-400' },
  { id: 'reading', title: 'Reading List', icon: BookOpen, color: 'text-blue-400' },
  { id: 'rss', title: 'News Feed', icon: Rss, color: 'text-orange-400' },
  { id: 'notes', title: 'Personal Notes', icon: FileText, color: 'text-purple-400' },
  { id: 'links', title: 'Useful Links', icon: Link, color: 'text-orange-400' },
  { id: 'profile', title: 'Profile', icon: User, color: 'text-pink-400' },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SidebarUI className="border-r border-gray-700" style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
      <SidebarHeader className="p-6 border-b border-gray-700" style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white">SecTracker</h1>
            <p className="text-sm text-gray-400">Bug Hunter Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
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
                    <item.icon className={`h-5 w-5 ${activeView === item.id ? 'text-white' : item.color}`} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-700" style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
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
