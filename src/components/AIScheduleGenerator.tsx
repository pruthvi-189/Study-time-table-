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
      // Simulate AI processing (we'll replace this with actual AI later)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get active days from preferences
      const activeDays = dayPreferences.filter(dp => dp.startTime && dp.endTime);
      
      if (activeDays.length === 0) {
        toast.error("Please set time preferences for at least one day first");
        return;
      }

      // For demo purposes, we'll generate a schedule based on the prompt keywords
      const newSchedule: TimeBlock[] = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      // Parse the prompt for keywords
      const lowerPrompt = prompt.toLowerCase();
      const earlyMorning = lowerPrompt.includes("early") || lowerPrompt.includes("morning");
      const lateNight = lowerPrompt.includes("night") || lowerPrompt.includes("late");
      const exerciseFocus = lowerPrompt.includes("exercise") || lowerPrompt.includes("fitness");
      const studyFocus = lowerPrompt.includes("study") || lowerPrompt.includes("focus") || lowerPrompt.includes("academic");
      const balancedLifestyle = lowerPrompt.includes("balance") || lowerPrompt.includes("varied");
      
      // Process each active day - with variety
      activeDays.forEach((dayPref, dayIndex) => {
        const day = dayPref.day;
        const dayNumber = days.indexOf(day);
        
        // Add variation based on the day of the week
        const isWeekend = day === "Saturday" || day === "Sunday";
        const isMiddleOfWeek = day === "Wednesday";
        
        // Vary morning start times by day
        let morningOffset = dayNumber % 2 === 0 ? 0 : 30; // Different start times on alternating days
        if (isWeekend) morningOffset = 60; // Later start on weekends
        
        const morningBase = earlyMorning ? "05:00" : "06:30";
        const [baseHour, baseMinute] = morningBase.split(":").map(Number);
        
        // Calculate morning start with offset
        const morningStartMinutes = (baseHour * 60 + baseMinute + morningOffset) % (24 * 60);
        const morningStartHour = Math.floor(morningStartMinutes / 60);
        const morningStartMinute = morningStartMinutes % 60;
        const morningStart = `${morningStartHour.toString().padStart(2, '0')}:${morningStartMinute.toString().padStart(2, '0')}`;
        
        // Calculate morning end with offset
        const morningEndMinutes = (morningStartMinutes + 60) % (24 * 60);
        const morningEndHour = Math.floor(morningEndMinutes / 60);
        const morningEndMinute = morningEndMinutes % 60;
        const morningEnd = `${morningEndHour.toString().padStart(2, '0')}:${morningEndMinute.toString().padStart(2, '0')}`;
        
        // Add morning routine
        newSchedule.push({
          id: `${day}-morning-routine`,
          activity: activities.find(a => a.type === "freshup"),
          day: day,
          startTime: morningStart,
          endTime: morningEnd,
          type: "freshup"
        });

        // Add exercise - vary by day
        if (exerciseFocus || dayNumber % 2 === 0 || isWeekend) {
          // Alternate between morning and evening exercise
          if ((dayNumber % 3 === 0 || balancedLifestyle) && !isWeekend) {
            // Evening exercise some days
            newSchedule.push({
              id: `${day}-exercise`,
              activity: activities.find(a => a.type === "exercise"),
              day: day,
              startTime: "17:30",
              endTime: "18:30",
              type: "exercise"
            });
          } else {
            // Morning exercise other days
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

        // Add school/work hours - different for weekends
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
          // Weekend leisure instead of school
          newSchedule.push({
            id: `${day}-leisure`,
            activity: activities.find(a => a.type === "extracurricular"),
            day: day,
            startTime: "10:00",
            endTime: "13:00",
            type: "extracurricular"
          });
        }

        // Add study sessions for different subjects on different days
        if (subjects.length > 0) {
          // Filter subjects by day - we'll rotate through them
          // Each day focuses on different subjects
          const todaySubjects = subjects.filter((_, idx) => {
            // Distribute subjects across days of week
            // Math: study it 3 times a week (Mon, Wed, Fri)
            if (idx === 0 && (day === "Monday" || day === "Wednesday" || day === "Friday")) {
              return true;
            }
            // Science: study it 2 times a week (Tue, Thu)
            else if (idx === 1 && (day === "Tuesday" || day === "Thursday")) {
              return true;
            }
            // Languages: study them 3 times a week (Mon, Thu, Sat) 
            else if (idx === 2 && (day === "Monday" || day === "Thursday" || day === "Saturday")) {
              return true;
            }
            // History/Social Studies: 2 times a week (Wed, Fri)
            else if (idx === 3 && (day === "Wednesday" || day === "Friday")) {
              return true;
            }
            // Art/Music: weekends
            else if (idx === 4 && (day === "Saturday" || day === "Sunday")) {
              return true;
            }
            // Other subjects spread throughout
            else if (idx > 4) {
              return (idx + dayNumber) % 7 === 0;
            }
            return false;
          });

          // If no subjects match our rotation, take at least one
          const subjectsToStudy = todaySubjects.length > 0 
            ? todaySubjects 
            : subjects.length > 0 ? [subjects[dayNumber % subjects.length]] : [];
          
          if (subjectsToStudy.length > 0) {
            // Vary start time by day
            let startHour = isWeekend ? 14 : 16;
            startHour = (startHour + dayNumber % 2) % 24; // Slight variation
            let startTime = `${startHour.toString().padStart(2, '0')}:00`;
            
            subjectsToStudy.forEach((subject, index) => {
              // Calculate study duration (1-2 hours)
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

        // Add evening activity - different by day
        const eveningActivities = [
          { start: "18:00", end: "20:00" }, // Standard evening activity
          { start: "17:30", end: "19:30" }, // Earlier evening activity
          { start: "19:00", end: "21:00" }  // Later evening activity
        ];
        
        const eveningVariation = dayNumber % eveningActivities.length;
        const eveningActivity = eveningActivities[eveningVariation];
        
        // Only add extracurricular if not a study-heavy day or if it's a weekend
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

        // Add bedtime routine - vary by day of week
        let bedtimeMins = lateNight ? 22 * 60 : 21 * 60; // Base bedtime in minutes
        
        // Adjust for weekends and day variations
        if (isWeekend) {
          bedtimeMins += 60; // 1 hour later on weekends
        } else if (isMiddleOfWeek) {
          bedtimeMins -= 30; // 30 mins earlier mid-week to recover
        } else {
          bedtimeMins += (dayNumber % 3) * 15; // Small variations other days
        }
        
        const bedtimeHour = Math.floor(bedtimeMins / 60);
        const bedtimeMinute = bedtimeMins % 60;
        const bedtimeStart = `${bedtimeHour.toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;
        
        // Sleep start is 1 hour after bedtime routine starts
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
        
        // Sleep until morning
        newSchedule.push({
          id: `${day}-sleep`,
          activity: activities.find(a => a.type === "sleep"),
          day: day,
          startTime: sleepStart,
          endTime: morningStart,
          type: "sleep"
        });
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
