import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Subject, Activity, DayPreference, TimeBlock } from "./TimetableGenerator";

interface AIScheduleGeneratorProps {
  subjects: Subject[];
  activities: Activity[];
  dayPreferences: DayPreference[];
  onScheduleGenerated: (schedule: TimeBlock[]) => void;
}

const AIScheduleGenerator: React.FC<AIScheduleGeneratorProps> = ({ 
  subjects, 
  activities, 
  dayPreferences,
  onScheduleGenerated 
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSchedule = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description of your day");
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const activeDays = dayPreferences.filter(dp => dp.startTime && dp.endTime);
      
      if (activeDays.length === 0) {
        toast.error("Please set time preferences for at least one day first");
        return;
      }

      const newSchedule: TimeBlock[] = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      const lowerPrompt = prompt.toLowerCase();
      const earlyMorning = lowerPrompt.includes("early") || lowerPrompt.includes("morning");
      const lateNight = lowerPrompt.includes("night") || lowerPrompt.includes("late");
      const exerciseFocus = lowerPrompt.includes("exercise") || lowerPrompt.includes("fitness");
      const studyFocus = lowerPrompt.includes("study") || lowerPrompt.includes("focus") || lowerPrompt.includes("academic");
      const balancedLifestyle = lowerPrompt.includes("balance") || lowerPrompt.includes("varied");
      
      activeDays.forEach((dayPref, dayIndex) => {
        const day = dayPref.day;
        const dayNumber = days.indexOf(day);
        
        const isWeekend = day === "Saturday" || day === "Sunday";
        const isMiddleOfWeek = day === "Wednesday";
        
        let morningOffset = dayNumber % 2 === 0 ? 0 : 30;
        if (isWeekend) morningOffset = 60;
        
        const morningBase = earlyMorning ? "05:00" : "06:30";
        const [baseHour, baseMinute] = morningBase.split(":").map(Number);
        
        const morningStartMinutes = (baseHour * 60 + baseMinute + morningOffset) % (24 * 60);
        const morningStartHour = Math.floor(morningStartMinutes / 60);
        const morningStartMinute = morningStartMinutes % 60;
        const morningStart = `${morningStartHour.toString().padStart(2, '0')}:${morningStartMinute.toString().padStart(2, '0')}`;
        
        const morningEndMinutes = (morningStartMinutes + 60) % (24 * 60);
        const morningEndHour = Math.floor(morningEndMinutes / 60);
        const morningEndMinute = morningEndMinutes % 60;
        const morningEnd = `${morningEndHour.toString().padStart(2, '0')}:${morningEndMinute.toString().padStart(2, '0')}`;

        const sleepActivity = activities.find(a => a.type === "sleep");
        if (sleepActivity) {
          newSchedule.push({
            id: `${day}-sleep-overnight`,
            activity: sleepActivity,
            day: day,
            startTime: "00:00",
            endTime: morningStart,
            type: "sleep"
          });
        }
        
        newSchedule.push({
          id: `${day}-morning-routine`,
          activity: activities.find(a => a.type === "freshup"),
          day: day,
          startTime: morningStart,
          endTime: morningEnd,
          type: "freshup"
        });

        if (exerciseFocus || dayNumber % 2 === 0 || isWeekend) {
          if ((dayNumber % 3 === 0 || balancedLifestyle) && !isWeekend) {
            newSchedule.push({
              id: `${day}-exercise`,
              activity: activities.find(a => a.type === "exercise"),
              day: day,
              startTime: "17:30",
              endTime: "18:30",
              type: "exercise"
            });
          } else {
            newSchedule.push({
              id: `${day}-exercise`,
              activity: activities.find(a => a.type === "exercise"),
              day: day,
              startTime: morningEnd,
              endTime: "07:45",
              type: "exercise"
            });
          }
        }

        if (!isWeekend) {
          newSchedule.push({
            id: `${day}-school`,
            activity: activities.find(a => a.type === "school"),
            day: day,
            startTime: "08:30",
            endTime: "15:30",
            type: "school"
          });
        } else {
          newSchedule.push({
            id: `${day}-leisure`,
            activity: activities.find(a => a.type === "extracurricular"),
            day: day,
            startTime: "10:00",
            endTime: "13:00",
            type: "extracurricular"
          });
        }

        if (subjects.length > 0) {
          const todaySubjects = subjects.filter((_, idx) => {
            if (idx === 0 && (day === "Monday" || day === "Wednesday" || day === "Friday")) {
              return true;
            }
            else if (idx === 1 && (day === "Tuesday" || day === "Thursday")) {
              return true;
            }
            else if (idx === 2 && (day === "Monday" || day === "Thursday" || day === "Saturday")) {
              return true;
            }
            else if (idx === 3 && (day === "Wednesday" || day === "Friday")) {
              return true;
            }
            else if (idx === 4 && (day === "Saturday" || day === "Sunday")) {
              return true;
            }
            else if (idx > 4) {
              return (idx + dayNumber) % 7 === 0;
            }
            return false;
          });

          const subjectsToStudy = todaySubjects.length > 0 
            ? todaySubjects 
            : subjects.length > 0 ? [subjects[dayNumber % subjects.length]] : [];
          
          if (subjectsToStudy.length > 0) {
            let startHour = isWeekend ? 14 : 16;
            startHour = (startHour + dayNumber % 2) % 24;
            let startTime = `${startHour.toString().padStart(2, '0')}:00`;
            
            subjectsToStudy.forEach((subject, index) => {
              const studyHours = studyFocus ? 2 : 1;
              const endHour = parseInt(startTime.split(":")[0]) + studyHours;
              const endTime = `${endHour.toString().padStart(2, '0')}:00`;
              
              newSchedule.push({
                id: `${day}-study-${subject.id}`,
                subject: subject,
                day: day,
                startTime: startTime,
                endTime: endTime,
                type: "study"
              });
              
              startTime = endTime;
            });
          }
        }

        const eveningActivities = [
          { start: "18:00", end: "20:00" },
          { start: "17:30", end: "19:30" },
          { start: "19:00", end: "21:00" }
        ];
        
        const eveningVariation = dayNumber % eveningActivities.length;
        const eveningActivity = eveningActivities[eveningVariation];
        
        if (!studyFocus || dayNumber % 2 === 0 || isWeekend) {
          newSchedule.push({
            id: `${day}-evening-activity`,
            activity: activities.find(a => a.type === "extracurricular"),
            day: day,
            startTime: eveningActivity.start,
            endTime: eveningActivity.end,
            type: "extracurricular"
          });
        }

        let bedtimeMins = lateNight ? 22 * 60 : 21 * 60;
        if (isWeekend) {
          bedtimeMins += 60;
        } else if (isMiddleOfWeek) {
          bedtimeMins -= 30;
        } else {
          bedtimeMins += (dayNumber % 3) * 15;
        }
        
        const bedtimeHour = Math.floor(bedtimeMins / 60);
        const bedtimeMinute = bedtimeMins % 60;
        const bedtimeStart = `${bedtimeHour.toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;
        
        const sleepMins = bedtimeMins + 60;
        const sleepHour = Math.floor(sleepMins / 60) % 24;
        const sleepMinute = sleepMins % 60;
        const sleepStart = `${sleepHour.toString().padStart(2, '0')}:${sleepMinute.toString().padStart(2, '0')}`;
        
        newSchedule.push({
          id: `${day}-bedtime`,
          activity: activities.find(a => a.type === "bedtime"),
          day: day,
          startTime: bedtimeStart,
          endTime: sleepStart,
          type: "bedtime"
        });
        
        newSchedule.push({
          id: `${day}-sleep-night`,
          activity: activities.find(a => a.type === "sleep"),
          day: day,
          startTime: sleepStart,
          endTime: "23:59",
          type: "sleep"
        });

        const freeTimeActivity = activities.find(a => a.type === "free");
        if (freeTimeActivity) {
          const dayBlocks = newSchedule.filter(block => block.day === day);
          dayBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          const timePoints = [];
          for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
              timePoints.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
          }
          
          timePoints.push("23:59");
          
          for (let i = 0; i < timePoints.length - 1; i++) {
            const currentTime = timePoints[i];
            const nextTime = timePoints[i+1];
            
            const isTimeSlotFree = !dayBlocks.some(block => 
              block.startTime <= currentTime && block.endTime > currentTime
            );
            
            if (isTimeSlotFree) {
              let j = i + 1;
              while (j < timePoints.length && !dayBlocks.some(block => 
                block.startTime <= timePoints[j] && block.endTime > timePoints[j]
              )) {
                j++;
              }
              
              if (j > i + 1) {
                newSchedule.push({
                  id: `${day}-free-${currentTime}`,
                  activity: freeTimeActivity,
                  day: day,
                  startTime: currentTime,
                  endTime: timePoints[j-1],
                  type: "free"
                });
                
                i = j - 1;
              }
            }
          }
        }
      });

      newSchedule.sort((a, b) => {
        const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
        if (dayOrder !== 0) return dayOrder;
        return a.startTime.localeCompare(b.startTime);
      });

      onScheduleGenerated(newSchedule);
      toast.success("AI schedule generated with daily variety!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Failed to generate schedule. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50/50">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-lg pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Schedule Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <Textarea 
              placeholder="Describe your ideal schedule. For example: 'I need a varied weekly routine with early mornings on weekdays, more exercise on weekends, and focus on different subjects each day.'"
              className="min-h-[100px] border-purple-200 focus-visible:ring-purple-400"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <Button 
            onClick={generateSchedule}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Varied Weekly Schedule
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIScheduleGenerator;
