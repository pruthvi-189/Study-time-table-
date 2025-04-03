
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
import { TimeBlock, DayPreference } from "./TimetableGenerator";
import { Button } from "@/components/ui/button";

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
    if (filteredTimetable.length === 0) return "09:00";
    return filteredTimetable.reduce(
      (earliest, block) => (block.startTime < earliest ? block.startTime : earliest),
      "23:59"
    );
  };

  const getLatestEndTime = () => {
    if (filteredTimetable.length === 0) return "17:00";
    return filteredTimetable.reduce(
      (latest, block) => (block.endTime > latest ? block.endTime : latest),
      "00:00"
    );
  };

  // Get all hours between earliest and latest
  const getTimeSlots = () => {
    const earliest = getEarliestStartTime();
    const latest = getLatestEndTime();
    
    const startHour = parseInt(earliest.split(":")[0]);
    const endHour = parseInt(latest.split(":")[0]);
    
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const timeSlots = getTimeSlots();

  const renderWeekView = () => {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
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
                // Find blocks that start at this time slot for this day
                const blocksForThisSlot = timetable.filter(
                  block => block.startTime === timeSlot && block.day === day
                );
                
                return (
                  <div key={`${day}-${timeSlot}`} className="relative p-1 min-h-[60px]">
                    {blocksForThisSlot.map(block => (
                      <div
                        key={block.id}
                        className="rounded p-2 h-full flex flex-col"
                        style={{ backgroundColor: block.subject.color }}
                      >
                        <div className="text-sm font-medium">{block.subject.name}</div>
                        <div className="text-xs opacity-80">
                          {formatTime(block.startTime)} - {formatTime(block.endTime)}
                        </div>
                      </div>
                    ))}
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
            <p className="text-gray-500">No study blocks scheduled for {selectedDay}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots.map(timeSlot => {
              const blocksForThisSlot = filteredTimetable.filter(
                block => block.startTime === timeSlot
              );
              
              if (blocksForThisSlot.length === 0) return null;
              
              return (
                <div key={timeSlot} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3">
                    <div className="font-medium">{formatTime(timeSlot)}</div>
                  </div>
                  
                  <div className="p-2 space-y-2">
                    {blocksForThisSlot.map(block => (
                      <div
                        key={block.id}
                        className="rounded-md p-3"
                        style={{ backgroundColor: block.subject.color }}
                      >
                        <div className="text-md font-medium">{block.subject.name}</div>
                        <div className="text-sm opacity-80">
                          {formatTime(block.startTime)} - {formatTime(block.endTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Study Timetable</h2>
        
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
            No timetable generated yet. Click "Generate Timetable" to create your study schedule.
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
