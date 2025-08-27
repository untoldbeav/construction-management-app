import { useLocation } from "wouter";
import { Home, FolderOpen, Calendar as CalendarIcon, TestTubeDiagonal, Bell, Plus, Camera } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/projects", label: "Projects", icon: FolderOpen },
    { path: "/calendar", label: "Calendar", icon: CalendarIcon },
    { path: "/materials", label: "Materials", icon: TestTubeDiagonal },
    { path: "/reminders", label: "Reminders", icon: Bell },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-card border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${
                    isActive(item.path)
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2 inline" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:left-4 lg:top-24 lg:w-64 lg:z-40">
        <nav className="bg-card rounded-lg border border-border p-4 sticky top-24">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <button 
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    data-testid={`nav-desktop-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label === "Materials" ? "Material Testing" : item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                className="w-full"
                data-testid="button-new-project"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                data-testid="button-quick-photo"
              >
                <Camera className="w-4 h-4 mr-2" />
                Quick Photo
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <Button 
          size="lg" 
          className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-all"
          data-testid="button-floating-camera"
        >
          <Camera className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
}
