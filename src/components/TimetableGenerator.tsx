
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/use-local-storage";
import SubjectForm from "./SubjectForm";
import Timetable from "./Timetable";
import PreferencesForm from "./PreferencesForm";
import ActivityForm from "./ActivityForm";

export type ActivityType = 
  | "study"
  | "sleep"
  | "freshup"
  | "exercise"
  | "school"
  | "extracurricular"
  | "bedtime";

export type TimePeriod = "morning" | "afternoon" | "evening";

export type Subject = {
  id: string;
  name: string;
  color: string;
  hoursPerWeek: number;
};

export type Activity = {
  id: string;
  name: string;
  type: ActivityType;
  color: string;
  hoursPerDay: number;
  timePeriod: TimePeriod; // Changed from priority to timePeriod
  fixedTime?: boolean;
  startTime?: string;
  endTime?: string;
};

export type DayPreference = {
  day: string;
  startTime: string;
  endTime: string;
  breakTime: string;
};

export type TimeBlock = {
  id: string;
  activity?: Activity;
  subject?: Subject;
  day: string;
  startTime: string;
  endTime: string;
  type: ActivityType | "break";
};

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "sleep",
    name: "Sleep",
    type: "sleep",
    color: "#9575cd",
    hoursPerDay: 8,
    timePeriod: "evening", // Changed from priority to timePeriod
    fixedTime: true,
    startTime: "22:00",
    endTime: "06:00"
  },
  {
    id: "freshup",
    name: "Morning Routine",
    type: "freshup",
    color: "#64b5f6",
    hoursPerDay: 1,
    timePeriod: "morning", // Changed from priority to timePeriod
    fixedTime: true,
    startTime: "06:00",
    endTime: "07:00"
  },
  {
    id: "exercise",
    name: "Exercise",
    type: "exercise",
    color: "#81c784",
    hoursPerDay: 1,
    timePeriod: "morning", // Changed from priority to timePeriod
    fixedTime: false,
  },
  {
    id: "school",
    name: "School",
    type: "school",
    color: "#ffb74d",
    hoursPerDay: 7,
    timePeriod: "morning", // Changed from priority to timePeriod
    fixedTime: true,
    startTime: "08:00",
    endTime: "15:00"
  },
  {
    id: "extracurricular",
    name: "Extra-curricular",
    type: "extracurricular",
    color: "#ff8a65",
    hoursPerDay: 2,
    timePeriod: "afternoon", // Changed from priority to timePeriod
    fixedTime: false,
  },
  {
    id: "bedtime",
    name: "Evening Routine",
    type: "bedtime",
    color: "#7986cb",
    hoursPerDay: 1,
    timePeriod: "evening", // Changed from priority to timePeriod
    fixedTime: true,
    startTime: "21:00",
    endTime: "22:00"
  }
];

const TimetableGenerator = () => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>("subjects", []);
  const [activities, setActivities] = useLocalStorage<Activity[]>(
    "activities", 
    DEFAULT_ACTIVITIES
  );
  const [dayPreferences, setDayPreferences] = useLocalStorage<DayPreference[]>(
    "dayPreferences",
    [
      {
        day: "Monday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Tuesday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Wednesday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Thursday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Friday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Saturday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Sunday",
        startTime: "06:00",
        endTime: "22:00",
        breakTime: "12:00-13:00",
      },
    ]
  );

  const [timetable, setTimetable] = useLocalStorage<TimeBlock[]>("timetable", []);
  const [activeTab, setActiveTab] = useState("activities");

  const generateTimetable = () => {
    // Clear previous timetable
    const newTimetable: TimeBlock[] = [];
    
    // Sort days to ensure consistent order
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availableDays = dayPreferences
      .filter(dp => {
        const start = dp.startTime;
        const end = dp.endTime;
        return start && end && start < end;
      })
      .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));
    
    if (availableDays.length === 0) {
      toast.error("Please set valid time preferences for at least one day");
      return;
    }

    // First schedule fixed activities for each day
    availableDays.forEach(dayPref => {
      const day = dayPref.day;
      const dayStartTime = dayPref.startTime;
      const dayEndTime = dayPref.endTime;
      
      // Add fixed activities first
      const fixedActivities = activities.filter(activity => activity.fixedTime && activity.startTime && activity.endTime);
      
      fixedActivities.forEach(activity => {
        // Check if activity falls within day hours
        if (activity.startTime! >= dayStartTime && activity.endTime! <= dayEndTime) {
          newTimetable.push({
            id: `${day}-${activity.id}`,
            activity: activity,
            day: day,
            startTime: activity.startTime!,
            endTime: activity.endTime!,
            type: activity.type
          });
        }
      });
      
      // Add breaks
      if (dayPref.breakTime && dayPref.breakTime.includes('-')) {
        const [breakStart, breakEnd] = dayPref.breakTime.split('-');
        if (breakStart && breakEnd) {
          newTimetable.push({
            id: `${day}-break`,
            day: day,
            startTime: breakStart,
            endTime: breakEnd,
            type: "break"
          });
        }
      }
    });
    
    // Create timeblocks array - 30 min intervals for the whole day
    const timeBlocks = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        timeBlocks.push(time);
      }
    }
    
    // For each day, identify free time slots
    availableDays.forEach(dayPref => {
      const day = dayPref.day;
      const dayStartTime = dayPref.startTime;
      const dayEndTime = dayPref.endTime;
      
      let freeTimeSlots: {start: string, end: string, period: TimePeriod}[] = [];
      
      // Initialize with full day, divided into time periods
      const morningEnd = "12:00";
      const afternoonEnd = "16:00";
      
      // Morning period (start of day to 12pm)
      if (dayStartTime < morningEnd) {
        freeTimeSlots.push({
          start: dayStartTime, 
          end: dayStartTime < morningEnd ? morningEnd : dayStartTime,
          period: "morning"
        });
      }
      
      // Afternoon period (12pm to 4pm)
      if (dayStartTime < afternoonEnd && dayEndTime > morningEnd) {
        freeTimeSlots.push({
          start: dayStartTime > morningEnd ? dayStartTime : morningEnd, 
          end: dayEndTime < afternoonEnd ? dayEndTime : afternoonEnd,
          period: "afternoon"
        });
      }
      
      // Evening period (4pm to end of day)
      if (dayEndTime > afternoonEnd) {
        freeTimeSlots.push({
          start: dayStartTime > afternoonEnd ? dayStartTime : afternoonEnd, 
          end: dayEndTime,
          period: "evening"
        });
      }
      
      // Remove occupied time slots
      const dayEvents = newTimetable.filter(block => block.day === day);
      
      freeTimeSlots = freeTimeSlots.flatMap(slot => {
        let resultSlots = [slot];
        
        dayEvents.forEach(event => {
          resultSlots = resultSlots.flatMap(currentSlot => {
            // No overlap
            if (event.endTime <= currentSlot.start || event.startTime >= currentSlot.end) {
              return [currentSlot];
            }
            
            // Event completely covers slot
            if (event.startTime <= currentSlot.start && event.endTime >= currentSlot.end) {
              return [];
            }
            
            // Event in middle of slot
            if (event.startTime > currentSlot.start && event.endTime < currentSlot.end) {
              return [
                {start: currentSlot.start, end: event.startTime, period: currentSlot.period},
                {start: event.endTime, end: currentSlot.end, period: currentSlot.period}
              ];
            }
            
            // Event overlaps start of slot
            if (event.startTime <= currentSlot.start && event.endTime < currentSlot.end) {
              return [{start: event.endTime, end: currentSlot.end, period: currentSlot.period}];
            }
            
            // Event overlaps end of slot
            if (event.startTime > currentSlot.start && event.endTime >= currentSlot.end) {
              return [{start: currentSlot.start, end: event.startTime, period: currentSlot.period}];
            }
            
            return [currentSlot];
          });
        });
        
        return resultSlots;
      });
      
      // Calculate total free time available for each period
      const periodFreeTimes: Record<TimePeriod, number> = {
        morning: 0,
        afternoon: 0,
        evening: 0
      };
      
      freeTimeSlots.forEach(slot => {
        const startParts = slot.start.split(':').map(Number);
        const endParts = slot.end.split(':').map(Number);
        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];
        periodFreeTimes[slot.period] += (endMinutes - startMinutes);
      });
      
      // Now distribute activities by time period
      const activitiesByPeriod: Record<TimePeriod, Activity[]> = {
        morning: activities.filter(a => !a.fixedTime && a.timePeriod === 'morning'),
        afternoon: activities.filter(a => !a.fixedTime && a.timePeriod === 'afternoon'),
        evening: activities.filter(a => !a.fixedTime && a.timePeriod === 'evening')
      };
      
      // Calculate study time needs - distribute evenly across periods for now
      const totalStudyMinutes = subjects.reduce((sum, s) => sum + (s.hoursPerWeek * 60 / 7), 0);
      const studyPerPeriod = Math.floor(totalStudyMinutes / 3);
      const studyNeeds: Record<TimePeriod, number> = {
        morning: studyPerPeriod,
        afternoon: studyPerPeriod,
        evening: totalStudyMinutes - (studyPerPeriod * 2) // Remainder goes to evening
      };
      
      // For each period, schedule activities and study time
      for (const period of ['morning', 'afternoon', 'evening'] as TimePeriod[]) {
        const periodActivities = activitiesByPeriod[period];
        let periodSlots = freeTimeSlots.filter(slot => slot.period === period);
        
        // Calculate total time needed for activities in this period
        const activitiesTimeNeeded = periodActivities.reduce((sum, a) => sum + a.hoursPerDay * 60, 0);
        
        if (activitiesTimeNeeded + studyNeeds[period] > periodFreeTimes[period]) {
          toast.warning(`Not enough free time in the ${period} period on ${day} to fit all activities and study.`);
        }
        
        // Distribute activities first
        for (const activity of periodActivities) {
          let minutesNeeded = activity.hoursPerDay * 60;
          let minutesScheduled = 0;
          
          // Try to fit this activity into free slots
          while (minutesScheduled < minutesNeeded && periodSlots.length > 0) {
            // Find best slot - pick the earliest one with sufficient duration
            const bestSlotIndex = periodSlots.findIndex(slot => {
              const startParts = slot.start.split(':').map(Number);
              const endParts = slot.end.split(':').map(Number);
              const startMinutes = startParts[0] * 60 + startParts[1];
              const endMinutes = endParts[0] * 60 + endParts[1];
              return (endMinutes - startMinutes) >= 30; // At least 30 min block
            });
            
            if (bestSlotIndex === -1) break;
            
            const slot = periodSlots[bestSlotIndex];
            
            // How much time to allocate
            const startParts = slot.start.split(':').map(Number);
            const endParts = slot.end.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];
            const slotDuration = endMinutes - startMinutes;
            
            // Take at most 60 minutes or what's needed
            const blockSize = Math.min(60, slotDuration, minutesNeeded - minutesScheduled);
            
            // Create block
            const blockEndMinutes = startMinutes + blockSize;
            const blockEndHour = Math.floor(blockEndMinutes / 60);
            const blockEndMin = blockEndMinutes % 60;
            const blockEnd = `${blockEndHour.toString().padStart(2, '0')}:${blockEndMin.toString().padStart(2, '0')}`;
            
            newTimetable.push({
              id: `${day}-${activity.id}-${slot.start}`,
              activity: activity,
              day: day,
              startTime: slot.start,
              endTime: blockEnd,
              type: activity.type
            });
            
            minutesScheduled += blockSize;
            
            // Update remaining time in this slot
            if (blockSize === slotDuration) {
              // Remove this slot
              periodSlots.splice(bestSlotIndex, 1);
            } else {
              // Shrink this slot
              periodSlots[bestSlotIndex].start = blockEnd;
            }
          }
        }
        
        // Now distribute study subjects across remaining slots in this period
        let subjectIndex = 0;
        const periodSubjects = [...subjects]; // Copy subjects to rotate through
        let subjectMinutes: { [key: string]: number } = {};
        subjects.forEach(s => subjectMinutes[s.id] = Math.floor(studyNeeds[period] / subjects.length)); 
        
        while (periodSlots.length > 0 && Object.values(subjectMinutes).some(m => m > 0)) {
          // Find best slot
          const bestSlotIndex = periodSlots.findIndex(slot => {
            const startParts = slot.start.split(':').map(Number);
            const endParts = slot.end.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];
            return (endMinutes - startMinutes) >= 30; // At least 30 min block
          });
          
          if (bestSlotIndex === -1) break;
          
          const slot = periodSlots[bestSlotIndex];
          
          // Find subject with remaining time
          let allocated = false;
          const startSubjectIndex = subjectIndex;
          
          do {
            const subject = periodSubjects[subjectIndex];
            if (subjectMinutes[subject.id] > 0) {
              // How much time to allocate
              const startParts = slot.start.split(':').map(Number);
              const endParts = slot.end.split(':').map(Number);
              const startMinutes = startParts[0] * 60 + startParts[1];
              const endMinutes = endParts[0] * 60 + endParts[1];
              const slotDuration = endMinutes - startMinutes;
              
              // Take at most 60 minutes or what's needed
              const blockSize = Math.min(60, slotDuration, subjectMinutes[subject.id]);
              
              // Create block
              const blockEndMinutes = startMinutes + blockSize;
              const blockEndHour = Math.floor(blockEndMinutes / 60);
              const blockEndMin = blockEndMinutes % 60;
              const blockEnd = `${blockEndHour.toString().padStart(2, '0')}:${blockEndMin.toString().padStart(2, '0')}`;
              
              newTimetable.push({
                id: `${day}-study-${subject.id}-${slot.start}`,
                subject: subject,
                day: day,
                startTime: slot.start,
                endTime: blockEnd,
                type: "study"
              });
              
              subjectMinutes[subject.id] -= blockSize;
              
              // Update remaining time in this slot
              if (blockSize === slotDuration) {
                // Remove this slot
                periodSlots.splice(bestSlotIndex, 1);
              } else {
                // Shrink this slot
                periodSlots[bestSlotIndex].start = blockEnd;
              }
              
              allocated = true;
            }
            
            // Move to next subject
            subjectIndex = (subjectIndex + 1) % periodSubjects.length;
          } while (!allocated && subjectIndex !== startSubjectIndex);
          
          if (!allocated) {
            // No subjects need more time
            break;
          }
        }
      }
    });

    // Sort timetable by day and time
    newTimetable.sort((a, b) => {
      const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
    
    setTimetable(newTimetable);
    toast.success("Full daily schedule generated!");
    
    // Switch to timetable tab
    setActiveTab("timetable");
  };

  const resetTimetable = () => {
    setTimetable([]);
    toast.info("Timetable cleared");
  };

  const exportTimetable = () => {
    // Create a printable version
    window.print();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Daily Schedule Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="subjects">Study Subjects</TabsTrigger>
              <TabsTrigger value="preferences">Time Preferences</TabsTrigger>
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities">
              <ActivityForm activities={activities} setActivities={setActivities} />
            </TabsContent>
            
            <TabsContent value="subjects">
              <SubjectForm subjects={subjects} setSubjects={setSubjects} />
            </TabsContent>
            
            <TabsContent value="preferences">
              <PreferencesForm 
                dayPreferences={dayPreferences} 
                setDayPreferences={setDayPreferences} 
              />
            </TabsContent>
            
            <TabsContent value="timetable">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3 justify-center sm:justify-between">
                  <Button 
                    onClick={generateTimetable}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Generate Timetable
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={resetTimetable} 
                      variant="outline"
                    >
                      Reset
                    </Button>
                    <Button 
                      onClick={exportTimetable}
                      variant="outline"
                    >
                      Print
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <Timetable 
                  timetable={timetable}
                  setTimetable={setTimetable} 
                  dayPreferences={dayPreferences}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableGenerator;
