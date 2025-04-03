
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

export type Subject = {
  id: string;
  name: string;
  color: string;
  hoursPerWeek: number;
};

export type DayPreference = {
  day: string;
  startTime: string;
  endTime: string;
  breakTime: string;
};

export type TimeBlock = {
  id: string;
  subject: Subject;
  day: string;
  startTime: string;
  endTime: string;
};

const TimetableGenerator = () => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>("subjects", []);
  const [dayPreferences, setDayPreferences] = useLocalStorage<DayPreference[]>(
    "dayPreferences",
    [
      {
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Tuesday",
        startTime: "09:00",
        endTime: "17:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Wednesday",
        startTime: "09:00",
        endTime: "17:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Thursday",
        startTime: "09:00",
        endTime: "17:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Friday",
        startTime: "09:00",
        endTime: "17:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Saturday",
        startTime: "10:00",
        endTime: "15:00",
        breakTime: "12:00-13:00",
      },
      {
        day: "Sunday",
        startTime: "10:00",
        endTime: "15:00",
        breakTime: "12:00-13:00",
      },
    ]
  );

  const [timetable, setTimetable] = useLocalStorage<TimeBlock[]>("timetable", []);
  const [activeTab, setActiveTab] = useState("subjects");

  const generateTimetable = () => {
    if (subjects.length === 0) {
      toast.error("Please add at least one subject before generating the timetable");
      return;
    }

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

    // Calculate total hours needed and available
    const totalHoursNeeded = subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0);
    let totalHoursAvailable = 0;
    
    availableDays.forEach(dp => {
      const startHour = parseInt(dp.startTime.split(":")[0]);
      const startMinutes = parseInt(dp.startTime.split(":")[1]);
      const endHour = parseInt(dp.endTime.split(":")[0]);
      const endMinutes = parseInt(dp.endTime.split(":")[1]);
      
      let breakDuration = 0;
      if (dp.breakTime) {
        const [breakStart, breakEnd] = dp.breakTime.split("-");
        if (breakStart && breakEnd) {
          const breakStartHour = parseInt(breakStart.split(":")[0]);
          const breakStartMinutes = parseInt(breakStart.split(":")[1]);
          const breakEndHour = parseInt(breakEnd.split(":")[0]);
          const breakEndMinutes = parseInt(breakEnd.split(":")[1]);
          
          breakDuration = 
            (breakEndHour - breakStartHour) + 
            (breakEndMinutes - breakStartMinutes) / 60;
        }
      }
      
      const dayHours = 
        (endHour - startHour) + 
        (endMinutes - startMinutes) / 60 - 
        breakDuration;
      
      totalHoursAvailable += dayHours;
    });

    if (totalHoursAvailable < totalHoursNeeded) {
      toast.warning(
        `Your subjects require ${totalHoursNeeded} hours, but you only have ${totalHoursAvailable.toFixed(1)} available hours in your schedule.`
      );
    }

    // Distribute subjects across available days
    let subjectIndex = 0;
    let remainingHours: { [key: string]: number } = {};
    subjects.forEach(s => remainingHours[s.id] = s.hoursPerWeek);
    
    for (const dayPref of availableDays) {
      const day = dayPref.day;
      let currentTime = dayPref.startTime;
      let endTime = dayPref.endTime;
      
      // Handle break time if specified
      const breakPeriods: { start: string; end: string }[] = [];
      if (dayPref.breakTime && dayPref.breakTime.includes('-')) {
        const [breakStart, breakEnd] = dayPref.breakTime.split('-');
        if (breakStart && breakEnd) {
          breakPeriods.push({ start: breakStart, end: breakEnd });
        }
      }

      while (currentTime < endTime) {
        // Check if currentTime is in a break period
        const isBreakTime = breakPeriods.some(
          period => currentTime >= period.start && currentTime < period.end
        );

        if (isBreakTime) {
          // Skip to the end of the break
          const activePeriod = breakPeriods.find(
            period => currentTime >= period.start && currentTime < period.end
          );
          currentTime = activePeriod ? activePeriod.end : currentTime;
          continue;
        }

        // Find next subject that needs time
        let allocated = false;
        const startSubjectIndex = subjectIndex;
        
        do {
          const subject = subjects[subjectIndex];
          if (remainingHours[subject.id] > 0) {
            // Calculate end time (1 hour block)
            const hourStr = currentTime.split(":")[0].padStart(2, "0");
            const minuteStr = currentTime.split(":")[1];
            const nextHour = (parseInt(hourStr) + 1).toString().padStart(2, "0");
            const blockEndTime = `${nextHour}:${minuteStr}`;
            
            if (blockEndTime <= endTime) {
              newTimetable.push({
                id: `${day}-${currentTime}-${subject.id}`,
                subject: subject,
                day: day,
                startTime: currentTime,
                endTime: blockEndTime,
              });
              
              remainingHours[subject.id] -= 1;
              currentTime = blockEndTime;
              allocated = true;
            } else {
              break; // End of day reached
            }
          }
          
          // Move to next subject
          subjectIndex = (subjectIndex + 1) % subjects.length;
        } while (!allocated && subjectIndex !== startSubjectIndex);
        
        if (!allocated) {
          // No subjects need more time or time slot doesn't fit
          break;
        }
      }
    }

    // Calculate how many hours couldn't be allocated
    const unallocatedHours = Object.values(remainingHours).reduce((sum, h) => sum + h, 0);
    setTimetable(newTimetable);
    
    if (unallocatedHours > 0) {
      toast.warning(`Could not allocate ${unallocatedHours} study hours. Consider adding more available time.`);
    } else {
      toast.success("Timetable successfully generated!");
    }
    
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
            Study Timetable Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="preferences">Time Preferences</TabsTrigger>
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
            </TabsList>
            
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
