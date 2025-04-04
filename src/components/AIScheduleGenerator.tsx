
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
      
      // Process each active day
      activeDays.forEach(dayPref => {
        const day = dayPref.day;
        
        // Add morning routine
        const morningStart = earlyMorning ? "05:00" : "06:30";
        newSchedule.push({
          id: `${day}-morning-routine`,
          activity: activities.find(a => a.type === "freshup"),
          day: day,
          startTime: morningStart,
          endTime: earlyMorning ? "06:00" : "07:30",
          type: "freshup"
        });

        // Add exercise if focused on fitness
        if (exerciseFocus) {
          newSchedule.push({
            id: `${day}-exercise`,
            activity: activities.find(a => a.type === "exercise"),
            day: day,
            startTime: earlyMorning ? "06:00" : "07:30",
            endTime: earlyMorning ? "07:00" : "08:30",
            type: "exercise"
          });
        }

        // Add school/work hours
        newSchedule.push({
          id: `${day}-school`,
          activity: activities.find(a => a.type === "school"),
          day: day,
          startTime: "08:30",
          endTime: "15:30",
          type: "school"
        });

        // Add study sessions for each subject if study focused
        if (studyFocus && subjects.length > 0) {
          let startTime = "16:00";
          subjects.forEach((subject, index) => {
            // Calculate end time (1 or 2 hours later depending on study focus)
            const hours = studyFocus ? 2 : 1;
            const endHour = parseInt(startTime.split(":")[0]) + hours;
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

        // Add evening activity
        newSchedule.push({
          id: `${day}-evening-activity`,
          activity: activities.find(a => a.type === "extracurricular"),
          day: day,
          startTime: "18:00",
          endTime: "20:00",
          type: "extracurricular"
        });

        // Add bedtime routine
        const bedtimeStart = lateNight ? "22:00" : "21:00";
        const sleepStart = lateNight ? "23:00" : "22:00";
        
        newSchedule.push({
          id: `${day}-bedtime`,
          activity: activities.find(a => a.type === "bedtime"),
          day: day,
          startTime: bedtimeStart,
          endTime: sleepStart,
          type: "bedtime"
        });
        
        newSchedule.push({
          id: `${day}-sleep`,
          activity: activities.find(a => a.type === "sleep"),
          day: day,
          startTime: sleepStart,
          endTime: earlyMorning ? "05:00" : "06:30",
          type: "sleep"
        });
      });

      onScheduleGenerated(newSchedule);
      toast.success("AI schedule generated!");
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
              placeholder="Describe your ideal day schedule. For example: 'I need to wake up early, focus on studying math and science, exercise in the morning, and go to bed late.'"
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
                Generate AI Schedule
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIScheduleGenerator;
