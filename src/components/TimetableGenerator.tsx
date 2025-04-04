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
import AIScheduleGenerator from "./AIScheduleGenerator";

export type ActivityType = 
  | "study"
  | "sleep"
  | "freshup"
  | "exercise"
  | "school"
  | "extracurricular"
  | "bedtime"
  | "free";

export type TimePeriod = "morning" | "afternoon" | "evening";

export type Subject = {
  id: string;
  name: string;
  color: string;
  hoursPerWeek: number;
  fixedTime?: boolean;
  startTime?: string;
  endTime?: string;
};

export type Activity = {
  id: string;
  name: string;
  type: ActivityType;
  color: string;
  hoursPerDay: number;
  timePeriod: TimePeriod;
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
    timePeriod: "evening",
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
    timePeriod: "morning",
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
    timePeriod: "morning",
    fixedTime: false,
  },
  {
    id: "school",
    name: "School",
    type: "school",
    color: "#ffb74d",
    hoursPerDay: 7,
    timePeriod: "morning",
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
    timePeriod: "afternoon",
    fixedTime: false,
  },
  {
    id: "bedtime",
    name: "Evening Routine",
    type: "bedtime",
    color: "#7986cb",
    hoursPerDay: 1,
    timePeriod: "evening",
    fixedTime: true,
    startTime: "21:00",
    endTime: "22:00"
  },
  {
    id: "free",
    name: "Free Time",
    type: "free",
    color: "#e0e0e0",
    hoursPerDay: 0,
    timePeriod: "afternoon",
    fixedTime: false
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
    const newTimetable: TimeBlock[] = [];
    
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

    availableDays.forEach(dayPref => {
      const day = dayPref.day;
      const dayStartTime = dayPref.startTime;
      const dayEndTime = dayPref.endTime;
      
      const fixedActivities = activities.filter(activity => activity.fixedTime && activity.startTime && activity.endTime);
      
      fixedActivities.forEach(activity => {
        if (activity.type === "sleep" && activity.startTime && activity.endTime) {
          const startHour = parseInt(activity.startTime.split(":")[0]);
          const endHour = parseInt(activity.endTime.split(":")[0]);
          
          if (startHour > endHour || (startHour === endHour && activity.startTime > activity.endTime)) {
            newTimetable.push({
              id: `${day}-${activity.id}-evening`,
              activity: activity,
              day: day,
              startTime: activity.startTime,
              endTime: "23:59",
              type: activity.type
            });
            
            newTimetable.push({
              id: `${day}-${activity.id}-morning`,
              activity: activity,
              day: day,
              startTime: "00:00",
              endTime: activity.endTime,
              type: activity.type
            });
          } else {
            if (
              (activity.startTime >= dayStartTime && activity.startTime < dayEndTime) ||
              (activity.endTime > dayStartTime && activity.endTime <= dayEndTime) ||
              (activity.startTime <= dayStartTime && activity.endTime >= dayEndTime)
            ) {
              const effectiveStartTime = activity.startTime >= dayStartTime ? activity.startTime : dayStartTime;
              const effectiveEndTime = activity.endTime <= dayEndTime ? activity.endTime : dayEndTime;
              
              newTimetable.push({
                id: `${day}-${activity.id}`,
                activity: activity,
                day: day,
                startTime: effectiveStartTime,
                endTime: effectiveEndTime,
                type: activity.type
              });
            }
          }
        } else {
          if (
            (activity.startTime! >= dayStartTime && activity.startTime! < dayEndTime) ||
            (activity.endTime! > dayStartTime && activity.endTime! <= dayEndTime) ||
            (activity.startTime! <= dayStartTime && activity.endTime! >= dayEndTime)
          ) {
            const effectiveStartTime = activity.startTime! < dayStartTime ? dayStartTime : activity.startTime!;
            const effectiveEndTime = activity.endTime! > dayEndTime ? dayEndTime : activity.endTime!;
            
            newTimetable.push({
              id: `${day}-${activity.id}`,
              activity: activity,
              day: day,
              startTime: effectiveStartTime,
              endTime: effectiveEndTime,
              type: activity.type
            });
          }
        }
      });
      
      const fixedSubjects = subjects.filter(subject => subject.fixedTime && subject.startTime && subject.endTime);
      
      fixedSubjects.forEach(subject => {
        if (subject.startTime! >= dayStartTime && subject.endTime! <= dayEndTime) {
          newTimetable.push({
            id: `${day}-subject-${subject.id}`,
            subject: subject,
            day: day,
            startTime: subject.startTime!,
            endTime: subject.endTime!,
            type: "study"
          });
        }
      });
      
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
      
      const timeBlocks = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          timeBlocks.push(time);
        }
      }
      
      let freeTimeSlots: {start: string, end: string, period: TimePeriod}[] = [];
      
      const morningEnd = "12:00";
      const afternoonEnd = "16:00";
      
      if (dayStartTime < morningEnd) {
        freeTimeSlots.push({
          start: dayStartTime, 
          end: dayStartTime < morningEnd ? morningEnd : dayStartTime,
          period: "morning"
        });
      }
      
      if (dayStartTime < afternoonEnd && dayEndTime > morningEnd) {
        freeTimeSlots.push({
          start: dayStartTime > morningEnd ? dayStartTime : morningEnd, 
          end: dayEndTime < afternoonEnd ? dayEndTime : afternoonEnd,
          period: "afternoon"
        });
      }
      
      if (dayEndTime > afternoonEnd) {
        freeTimeSlots.push({
          start: dayStartTime > afternoonEnd ? dayStartTime : afternoonEnd, 
          end: dayEndTime,
          period: "evening"
        });
      }
      
      const dayEvents = newTimetable.filter(block => block.day === day);
      
      freeTimeSlots = freeTimeSlots.flatMap(slot => {
        let resultSlots = [slot];
        
        dayEvents.forEach(event => {
          resultSlots = resultSlots.flatMap(currentSlot => {
            if (event.endTime <= currentSlot.start || event.startTime >= currentSlot.end) {
              return [currentSlot];
            }
            
            if (event.startTime <= currentSlot.start && event.endTime >= currentSlot.end) {
              return [];
            }
            
            if (event.startTime > currentSlot.start && event.endTime < currentSlot.end) {
              return [
                {start: currentSlot.start, end: event.startTime, period: currentSlot.period},
                {start: event.endTime, end: currentSlot.end, period: currentSlot.period}
              ];
            }
            
            if (event.startTime <= currentSlot.start && event.endTime < currentSlot.end) {
              return [{start: event.endTime, end: currentSlot.end, period: currentSlot.period}];
            }
            
            if (event.startTime > currentSlot.start && event.endTime >= currentSlot.end) {
              return [{start: currentSlot.start, end: event.startTime, period: currentSlot.period}];
            }
            
            return [currentSlot];
          });
        });
        
        return resultSlots;
      });
      
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
      
      const activitiesByPeriod: Record<TimePeriod, Activity[]> = {
        morning: activities.filter(a => !a.fixedTime && a.timePeriod === 'morning'),
        afternoon: activities.filter(a => !a.fixedTime && a.timePeriod === 'afternoon'),
        evening: activities.filter(a => !a.fixedTime && a.timePeriod === 'evening')
      };
      
      const flexibleSubjects = subjects.filter(s => !s.fixedTime);
      
      const totalStudyMinutes = flexibleSubjects.reduce((sum, s) => sum + (s.hoursPerWeek * 60 / 7), 0);
      const studyPerPeriod = Math.floor(totalStudyMinutes / 3);
      const studyNeeds: Record<TimePeriod, number> = {
        morning: studyPerPeriod,
        afternoon: studyPerPeriod,
        evening: totalStudyMinutes - (studyPerPeriod * 2)
      };
      
      for (const period of ['morning', 'afternoon', 'evening'] as TimePeriod[]) {
        const periodActivities = activitiesByPeriod[period];
        let periodSlots = freeTimeSlots.filter(slot => slot.period === period);
        
        const activitiesTimeNeeded = periodActivities.reduce((sum, a) => sum + a.hoursPerDay * 60, 0);
        
        if (activitiesTimeNeeded + studyNeeds[period] > periodFreeTimes[period]) {
          toast.warning(`Not enough free time in the ${period} period on ${day} to fit all activities and study.`);
        }
        
        for (const activity of periodActivities) {
          let minutesNeeded = activity.hoursPerDay * 60;
          let minutesScheduled = 0;
          
          while (minutesScheduled < minutesNeeded && periodSlots.length > 0) {
            const bestSlotIndex = periodSlots.findIndex(slot => {
              const startParts = slot.start.split(':').map(Number);
              const endParts = slot.end.split(':').map(Number);
              const startMinutes = startParts[0] * 60 + startParts[1];
              const endMinutes = endParts[0] * 60 + endParts[1];
              return (endMinutes - startMinutes) >= 30;
            });
            
            if (bestSlotIndex === -1) break;
            
            const slot = periodSlots[bestSlotIndex];
            
            const startParts = slot.start.split(':').map(Number);
            const endParts = slot.end.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];
            const slotDuration = endMinutes - startMinutes;
            
            const blockSize = Math.min(60, slotDuration, minutesNeeded - minutesScheduled);
            
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
            
            if (blockSize === slotDuration) {
              periodSlots.splice(bestSlotIndex, 1);
            } else {
              periodSlots[bestSlotIndex].start = blockEnd;
            }
          }
        }
        
        let subjectIndex = 0;
        const periodSubjects = [...flexibleSubjects];
        let subjectMinutes: { [key: string]: number } = {};
        
        flexibleSubjects.forEach(s => subjectMinutes[s.id] = Math.floor(studyNeeds[period] / flexibleSubjects.length));
        
        while (periodSlots.length > 0 && Object.values(subjectMinutes).some(m => m > 0)) {
          const suitableSlotIndex = periodSlots.findIndex(slot => {
            const startParts = slot.start.split(':').map(Number);
            const endParts = slot.end.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];
            return (endMinutes - startMinutes) >= 60;
          });
          
          if (suitableSlotIndex === -1) break;
          
          const slot = periodSlots[suitableSlotIndex];
          
          let allocated = false;
          const startSubjectIndex = subjectIndex;
          
          do {
            const subject = periodSubjects[subjectIndex];
            if (subjectMinutes[subject.id] > 0) {
              const startParts = slot.start.split(':').map(Number);
              const endParts = slot.end.split(':').map(Number);
              const startMinutes = startParts[0] * 60 + startParts[1];
              const endMinutes = endParts[0] * 60 + endParts[1];
              const slotDuration = endMinutes - startMinutes;
              
              const blockSize = Math.max(60, Math.min(slotDuration, subjectMinutes[subject.id]));
              
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
              
              if (blockSize === slotDuration) {
                periodSlots.splice(suitableSlotIndex, 1);
              } else {
                periodSlots[suitableSlotIndex].start = blockEnd;
              }
              
              allocated = true;
            }
            
            subjectIndex = (subjectIndex + 1) % periodSubjects.length;
          } while (!allocated && subjectIndex !== startSubjectIndex);
          
          if (!allocated) {
            break;
          }
        }
        
        const freeTimeActivity = activities.find(a => a.type === "free");
        if (freeTimeActivity && periodSlots.length > 0) {
          periodSlots.forEach(slot => {
            const startParts = slot.start.split(':').map(Number);
            const endParts = slot.end.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            const endMinutes = endParts[0] * 60 + endParts[1];
            const slotDuration = endMinutes - startMinutes;
            
            if (slotDuration >= 15) {
              newTimetable.push({
                id: `${day}-free-${slot.start}`,
                activity: freeTimeActivity,
                day: day,
                startTime: slot.start,
                endTime: slot.end,
                type: "free"
              });
            }
          });
        }
      }
    });
    
    const sortedTimetable = [...newTimetable].sort((a, b) => {
      const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
    
    setTimetable(sortedTimetable);
    toast.success("Full daily schedule generated!");
    
    setActiveTab("timetable");
  };

  const resetTimetable = () => {
    setTimetable([]);
    toast.info("Timetable cleared");
  };

  const exportTimetable = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Daily Schedule Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="activities" className="text-sm md:text-base">Activities</TabsTrigger>
              <TabsTrigger value="subjects" className="text-sm md:text-base">Study Subjects</TabsTrigger>
              <TabsTrigger value="preferences" className="text-sm md:text-base">Time Preferences</TabsTrigger>
              <TabsTrigger value="ai" className="text-sm md:text-base">AI Generator</TabsTrigger>
              <TabsTrigger value="timetable" className="text-sm md:text-base">Timetable</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="animate-fade-in">
              <ActivityForm activities={activities} setActivities={setActivities} />
            </TabsContent>
            
            <TabsContent value="subjects" className="animate-fade-in">
              <SubjectForm subjects={subjects} setSubjects={setSubjects} />
            </TabsContent>
            
            <TabsContent value="preferences" className="animate-fade-in">
              <PreferencesForm 
                dayPreferences={dayPreferences} 
                setDayPreferences={setDayPreferences} 
              />
            </TabsContent>
            
            <TabsContent value="ai" className="animate-fade-in">
              <AIScheduleGenerator 
                subjects={subjects}
                activities={activities}
                dayPreferences={dayPreferences}
                onScheduleGenerated={(newSchedule) => {
                  setTimetable(newSchedule);
                  setActiveTab("timetable");
                }}
              />
            </TabsContent>
            
            <TabsContent value="timetable" className="animate-fade-in">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3 justify-center sm:justify-between">
                  <Button 
                    onClick={generateTimetable}
                    className="bg-purple-600 hover:bg-purple-700 transform transition-transform hover:scale-105"
                  >
                    Generate Timetable
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={resetTimetable} 
                      variant="outline"
                      className="transform transition-transform hover:scale-105"
                    >
                      Reset
                    </Button>
                    <Button 
                      onClick={exportTimetable}
                      variant="outline"
                      className="transform transition-transform hover:scale-105"
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
