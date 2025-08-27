import { User, Wifi, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg p-2">
              <svg 
                className="text-primary-foreground w-6 h-6" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                data-testid="logo-icon"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground" data-testid="app-title">
              FieldPro
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-2" data-testid="sync-status">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Synced</span>
            </div>
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            
            {/* User Profile */}
            <button 
              className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2 hover:bg-accent transition-colors"
              data-testid="button-user-profile"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">John Smith</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
