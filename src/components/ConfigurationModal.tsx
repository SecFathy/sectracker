
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Database } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

interface DatabaseConfig {
  type: 'supabase' | 'postgresql';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  postgresqlUrl?: string;
  postgresqlHost?: string;
  postgresqlPort?: string;
  postgresqlDatabase?: string;
  postgresqlUsername?: string;
  postgresqlPassword?: string;
  offlineMode: boolean;
}

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigurationModal({ isOpen, onClose }: ConfigurationModalProps) {
  const { theme } = useTheme();
  const isHackerTheme = theme === 'hacker';
  const { toast } = useToast();
  
  const [config, setConfig] = useState<DatabaseConfig>({
    type: 'supabase',
    supabaseUrl: 'https://shxncrzawwosgupunuue.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeG5jcnphd3dvc2d1cHVudXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MjE5NDUsImV4cCI6MjA2Mzk5Nzk0NX0.YmrNMdYFVMwcm1GgLOQWkMu0VKLDNeF9ZntRFCOFP7s',
    postgresqlUrl: 'postgresql://sectracker_user:sectracker_password@localhost:5432/sectracker',
    postgresqlHost: 'localhost',
    postgresqlPort: '5432',
    postgresqlDatabase: 'sectracker',
    postgresqlUsername: 'sectracker_user',
    postgresqlPassword: 'sectracker_password',
    offlineMode: false
  });

  useEffect(() => {
    // Load configuration from localStorage
    const savedConfig = localStorage.getItem('database_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      // Save configuration to localStorage
      localStorage.setItem('database_config', JSON.stringify(config));
      
      // Update environment variables for the session
      if (config.type === 'supabase' && !config.offlineMode) {
        (window as any).__SUPABASE_URL__ = config.supabaseUrl;
        (window as any).__SUPABASE_ANON_KEY__ = config.supabaseAnonKey;
        (window as any).__OFFLINE_MODE__ = false;
      } else if (config.type === 'postgresql' || config.offlineMode) {
        (window as any).__DATABASE_URL__ = config.postgresqlUrl;
        (window as any).__OFFLINE_MODE__ = true;
      }

      toast({
        title: "Configuration Saved",
        description: "Database configuration has been saved. Please refresh the page for changes to take effect."
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async () => {
    toast({
      title: "Testing Connection",
      description: "Connection test feature will be implemented in a future update."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[80vh] overflow-y-auto ${isHackerTheme ? "bg-black border-green-600 text-green-400" : "bg-gray-800 border-gray-700 text-white"}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center space-x-2 ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
            <Database className="h-5 w-5" />
            <span>Database Configuration</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.offlineMode}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, offlineMode: checked }))}
              className={isHackerTheme ? "data-[state=checked]:bg-green-600" : ""}
            />
            <Label className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
              Offline Mode (Use local PostgreSQL)
            </Label>
          </div>

          {!config.offlineMode && (
            <div>
              <Label className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                Database Type
              </Label>
              <Select value={config.type} onValueChange={(value) => setConfig(prev => ({ ...prev, type: value as 'supabase' | 'postgresql' }))}>
                <SelectTrigger className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isHackerTheme ? "bg-green-950 border-green-600" : "bg-gray-700 border-gray-600"}>
                  <SelectItem value="supabase">Supabase</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.type === 'supabase' && !config.offlineMode && (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                Supabase Configuration
              </h3>
              
              <div>
                <Label htmlFor="supabaseUrl" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                  Supabase URL
                </Label>
                <Input
                  id="supabaseUrl"
                  value={config.supabaseUrl || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                  className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                  placeholder="https://your-project.supabase.co"
                />
              </div>

              <div>
                <Label htmlFor="supabaseKey" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                  Supabase Anon Key
                </Label>
                <Input
                  id="supabaseKey"
                  type="password"
                  value={config.supabaseAnonKey || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
                  className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                  placeholder="Your Supabase anon key"
                />
              </div>
            </div>
          )}

          {(config.type === 'postgresql' || config.offlineMode) && (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isHackerTheme ? "text-green-400 font-mono" : "text-white"}`}>
                PostgreSQL Configuration
              </h3>

              <div>
                <Label htmlFor="postgresqlUrl" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                  Connection URL
                </Label>
                <Input
                  id="postgresqlUrl"
                  value={config.postgresqlUrl || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, postgresqlUrl: e.target.value }))}
                  className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                  placeholder="postgresql://user:password@host:port/database"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postgresqlHost" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                    Host
                  </Label>
                  <Input
                    id="postgresqlHost"
                    value={config.postgresqlHost || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, postgresqlHost: e.target.value }))}
                    className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                    placeholder="localhost"
                  />
                </div>

                <div>
                  <Label htmlFor="postgresqlPort" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                    Port
                  </Label>
                  <Input
                    id="postgresqlPort"
                    value={config.postgresqlPort || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, postgresqlPort: e.target.value }))}
                    className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                    placeholder="5432"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postgresqlDatabase" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                    Database
                  </Label>
                  <Input
                    id="postgresqlDatabase"
                    value={config.postgresqlDatabase || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, postgresqlDatabase: e.target.value }))}
                    className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                    placeholder="sectracker"
                  />
                </div>

                <div>
                  <Label htmlFor="postgresqlUsername" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                    Username
                  </Label>
                  <Input
                    id="postgresqlUsername"
                    value={config.postgresqlUsername || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, postgresqlUsername: e.target.value }))}
                    className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                    placeholder="sectracker_user"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="postgresqlPassword" className={isHackerTheme ? "text-green-300 font-mono" : "text-gray-300"}>
                  Password
                </Label>
                <Input
                  id="postgresqlPassword"
                  type="password"
                  value={config.postgresqlPassword || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, postgresqlPassword: e.target.value }))}
                  className={isHackerTheme ? "bg-green-950 border-green-600 text-green-300 font-mono" : "bg-gray-700 border-gray-600 text-white"}
                  placeholder="Your database password"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              Test Connection
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={isHackerTheme ? "border-green-600 text-green-400 hover:bg-green-950/50 font-mono" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={isHackerTheme ? "bg-green-600 hover:bg-green-700 text-black font-mono" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
