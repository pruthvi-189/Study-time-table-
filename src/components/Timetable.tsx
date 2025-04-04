import React, { useState } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeBlock, DayPreference, ActivityType } from "./TimetableGenerator";
import { Button } from "@/components/ui/button";
import { AlarmClock, Book, School, Bed, Clock, Dumbbell, Coffee, Music } from "lucide-react";

interface TimetableProps {
  timetable: TimeBlock[];
  setTimetable: React.Dispatch<React.SetStateAction<TimeBlock[]>>;
  dayPreferences: DayPreference[];
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

// Activity type icons
const activityIcons: Record<ActivityType | "break", React.ReactNode> = {
  study: <Book size={16} />,
  sleep: <Bed size={16} />,
  freshup: <Coffee size={16} />,
  exercise: <Dumbbell size={16} />,
  school: <School size={16} />,
  extracurricular: <Music size={16} />,
  bedtime: <AlarmClock size={16} />,
  free: <Clock size={16} />,
  break: <Clock size={16} />
};

const Timetable: React.FC<TimetableProps> = ({ timetable, setTimetable, dayPreferences }) => {
  const [viewType, setViewType] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState<string>(days[0]);

  const activeDays = days.filter(day => {
    const dayPref = dayPreferences.find(dp => dp.day === day);
    return dayPref && dayPref.startTime && dayPref.endTime;
  });

  const filteredTimetable = viewType === "day" 
    ? timetable.filter(block => block.day === selectedDay)
    : timetable;

  const getEarliestStartTime = () => {
    if (filteredTimetable.length === 0) return "06:00";
    return filteredTimetable.reduce(
      (earliest, block) => (block.startTime < earliest ? block.startTime : earliest),
      "23:59"
    );
  };

  const getLatestEndTime = () => {
    if (filteredTimetable.length === 0) return "22:00";
    return filteredTimetable.reduce(
      (latest, block) => (block.endTime > latest ? block.endTime : latest),
      "00:00"
    );
  };

  const getTimeSlots = () => {
    const earliest = getEarliestStartTime();
    const latest = getLatestEndTime();
    
    const startHour = parseInt(earliest.split(":")[0]);
    const endHour = parseInt(latest.split(":")[0]);
    
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = getTimeSlots();

  const getBlockLabel = (block: TimeBlock) => {
    if (block.type === "break") return "Break";
    if (block.type === "free") return "Free Time";
    if (block.subject) return block.subject.name;
    if (block.activity) return block.activity.name;
    return "";
  };

  const getBlockColor = (block: TimeBlock) => {
    if (block.type === "break") return "#f0f0f0";
    if (block.type === "free") return "#e0e0e0";
    if (block.subject) return block.subject.color;
    if (block.activity) return block.activity.color;
    return "#cccccc";
  };

  const getBlockIcon = (block: TimeBlock) => {
    return activityIcons[block.type] || <Clock size={16} />;
  };

  const renderWeekView = () => {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-1 font-medium text-center py-2">
            <div className="bg-gray-100 rounded p-2">Time</div>
            {activeDays.map(day => (
              <div 
                key={day} 
                className="bg-gray-100 rounded p-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          {timeSlots.map((timeSlot, index) => (
            <div key={timeSlot} className="grid grid-cols-8 gap-1 border-t">
              <div className="p-2 text-center text-sm text-gray-700">
                {formatTime(timeSlot)}
              </div>
              
              {activeDays.map(day => {
                const blocksForThisSlot = timetable.filter(
                  block => {
                    return block.day === day && 
                           block.startTime <= timeSlot && 
                           block.endTime > timeSlot;
                  }
                );
                
                return (
                  <div key={`${day}-${timeSlot}`} className="relative p-1 min-h-[60px]">
                    {blocksForThisSlot.map(block => {
                      const isStartSlot = block.startTime === timeSlot;
                      
                      const startSlotIndex = timeSlots.indexOf(block.startTime);
                      const endSlotIndex = timeSlots.findIndex(t => t >= block.endTime);
                      const slotSpan = endSlotIndex - startSlotIndex || 1;
                      
                      if (!isStartSlot) return null;
                      
                      return (
                        <div
                          key={block.id}
                          className="rounded p-2 h-full flex flex-col absolute top-0 left-0 right-0 m-1"
                          style={{ 
                            backgroundColor: getBlockColor(block),
                            height: `${slotSpan * 60}px`,
                            zIndex: 1
                          }}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            {getBlockIcon(block)}
                            <span>{getBlockLabel(block)}</span>
                          </div>
                          <div className="text-xs opacity-80">
                            {formatTime(block.startTime)} - {formatTime(block.endTime)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{selectedDay}</h3>
          <Select
            value={selectedDay}
            onValueChange={setSelectedDay}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {activeDays.map(day => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTimetable.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No activities scheduled for {selectedDay}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTimetable.map(block => (
              <div key={block.id} className="border rounded-lg overflow-hidden">
                <div className="p-3" style={{ backgroundColor: getBlockColor(block) }}>
                  <div className="flex items-center gap-2 font-medium">
                    {getBlockIcon(block)}
                    <div>{getBlockLabel(block)}</div>
                  </div>
                  <div className="text-sm opacity-80 mt-1">
                    {formatTime(block.startTime)} - {formatTime(block.endTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Daily Schedule</h2>
        
        <div className="flex gap-2">
          <Button
            variant={viewType === "week" ? "default" : "outline"}
            onClick={() => setViewType("week")}
            className={viewType === "week" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Week View
          </Button>
          <Button
            variant={viewType === "day" ? "default" : "outline"}
            onClick={() => setViewType("day")}
            className={viewType === "day" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Day View
          </Button>
        </div>
      </div>

      {timetable.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No timetable generated yet. Click "Generate Timetable" to create your daily schedule.
          </p>
        </div>
      ) : (
        <div className="print:bg-white">
          {viewType === "week" ? renderWeekView() : renderDayView()}
        </div>
      )}
    </div>
  );
};

export default Timetable;
