import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: events = [] } = useQuery({
    queryKey: ["/api/calendar/events", currentDate.getMonth(), currentDate.getFullYear()],
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    if (!day) return [];
    
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const getTodaysEvents = () => {
    const today = new Date();
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString();
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "inspection":
        return "bg-primary";
      case "visit":
        return "bg-orange-500";
      case "deadline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const days = getDaysInMonth();
  const todaysEvents = getTodaysEvents();

  return (
    <div className="space-y-6 lg:ml-72">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Calendar</h1>
          <p className="text-muted-foreground">Track project progress and inspection schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span 
            className="font-medium text-foreground min-w-32 text-center"
            data-testid="text-current-month"
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-muted">
            {dayNames.map((dayName) => (
              <div 
                key={dayName} 
                className="p-3 text-center text-sm font-medium text-muted-foreground"
                data-testid={`header-${dayName.toLowerCase()}`}
              >
                {dayName}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 divide-x divide-border">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = day && 
                new Date().toDateString() === 
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              
              return (
                <div 
                  key={index}
                  className="min-h-24 p-2 border-b border-border hover:bg-accent transition-colors"
                  data-testid={day ? `calendar-day-${day}` : `calendar-empty-${index}`}
                >
                  {day && (
                    <>
                      <div 
                        className={`text-sm font-medium mb-1 ${
                          isToday ? "text-primary font-bold" : "text-foreground"
                        }`}
                        data-testid={`day-number-${day}`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event: any) => (
                          <div
                            key={event.id}
                            className={`text-xs text-white px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                            title={`${event.title} - ${event.projectName}`}
                            data-testid={`event-${event.id}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No events scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {todaysEvents.map((event: any) => (
                <div 
                  key={event.id}
                  className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md"
                  data-testid={`today-event-${event.id}`}
                >
                  <div className={`w-3 h-8 rounded-full ${getEventColor(event.type)}`}></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground" data-testid={`text-event-title-${event.id}`}>
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-event-project-${event.id}`}>
                      {event.description}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-event-time-${event.id}`}>
                      <Clock className="w-3 h-3 mr-1 inline" />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button size="sm" data-testid={`button-event-details-${event.id}`}>
                    Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
