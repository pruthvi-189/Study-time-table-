
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DayPreference } from "./TimetableGenerator";

interface PreferencesFormProps {
  dayPreferences: DayPreference[];
  setDayPreferences: React.Dispatch<React.SetStateAction<DayPreference[]>>;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  dayPreferences,
  setDayPreferences,
}) => {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  const toggleDayExpanded = (day: string) => {
    setExpandedDays(
      expandedDays.includes(day)
        ? expandedDays.filter(d => d !== day)
        : [...expandedDays, day]
    );
  };

  const isDayEnabled = (day: string) => {
    const dayPref = dayPreferences.find(dp => dp.day === day);
    return !!(dayPref && dayPref.startTime && dayPref.endTime);
  };

  const toggleDayEnabled = (day: string, enabled: boolean) => {
    setDayPreferences(prev => {
      return prev.map(dp => {
        if (dp.day === day) {
          return {
            ...dp,
            startTime: enabled ? "09:00" : "",
            endTime: enabled ? "17:00" : "",
            breakTime: enabled ? "12:00-13:00" : "",
          };
        }
        return dp;
      });
    });

    // Automatically expand the day when enabling it
    if (enabled && !expandedDays.includes(day)) {
      toggleDayExpanded(day);
    }
  };

  const updateDayPreference = (
    day: string,
    field: keyof DayPreference,
    value: string
  ) => {
    setDayPreferences(prev => {
      return prev.map(dp => {
        if (dp.day === day) {
          return { ...dp, [field]: value };
        }
        return dp;
      });
    });
  };

  const validateTimeInput = (value: string): boolean => {
    // Simple validation for HH:MM format
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
  };

  const validateBreakTime = (value: string): boolean => {
    // Validate format HH:MM-HH:MM
    if (!value) return true; // Empty is valid
    
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(value)) return false;
    
    const [start, end] = value.split('-');
    return start < end;
  };

  const handleTimeChange = (
    day: string,
    field: keyof DayPreference,
    value: string
  ) => {
    // Allow empty values
    if (value === "") {
      updateDayPreference(day, field, value);
      return;
    }
    
    // Validate based on field type
    let isValid = false;
    
    if (field === "breakTime") {
      isValid = validateBreakTime(value);
    } else {
      isValid = validateTimeInput(value);
    }
    
    if (isValid) {
      updateDayPreference(day, field, value);
    } else {
      toast.error(`Invalid time format for ${field}`);
    }
  };

  // Apply same settings to all days
  const applyToAllDays = (sourceDayName: string) => {
    const sourceDay = dayPreferences.find(dp => dp.day === sourceDayName);
    if (!sourceDay) return;
    
    setDayPreferences(prev => {
      return prev.map(dp => {
        if (dp.day !== sourceDayName) {
          return {
            ...dp,
            startTime: sourceDay.startTime,
            endTime: sourceDay.endTime,
            breakTime: sourceDay.breakTime,
          };
        }
        return dp;
      });
    });
    
    toast.success(`Applied ${sourceDayName}'s settings to all days`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Study Time Preferences</h2>
        <p className="text-gray-500 mt-1">
          Set your available time slots for each day of the week.
        </p>
      </div>

      <Accordion
        type="multiple"
        value={expandedDays}
        onValueChange={setExpandedDays}
        className="space-y-4"
      >
        {days.map(day => {
          const dayPref = dayPreferences.find(dp => dp.day === day) || {
            day,
            startTime: "",
            endTime: "",
            breakTime: "",
          };
          
          const isEnabled = isDayEnabled(day);
          
          return (
            <AccordionItem 
              key={day} 
              value={day}
              className={`border rounded-lg ${
                isEnabled ? "border-purple-200" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center px-4 py-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={checked => toggleDayEnabled(day, checked)}
                  className="mr-3"
                />
                <AccordionTrigger className="flex-1 hover:no-underline">
                  <span className={isEnabled ? "font-medium" : "text-gray-500"}>
                    {day}
                  </span>
                </AccordionTrigger>
              </div>
              
              <AccordionContent className="px-4 pb-4">
                {isEnabled && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${day}-start`}>Start Time (HH:MM)</Label>
                        <Input
                          id={`${day}-start`}
                          placeholder="09:00"
                          value={dayPref.startTime}
                          onChange={e => handleTimeChange(day, "startTime", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`${day}-end`}>End Time (HH:MM)</Label>
                        <Input
                          id={`${day}-end`}
                          placeholder="17:00"
                          value={dayPref.endTime}
                          onChange={e => handleTimeChange(day, "endTime", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${day}-break`}>
                        Break Time (HH:MM-HH:MM, optional)
                      </Label>
                      <Input
                        id={`${day}-break`}
                        placeholder="12:00-13:00"
                        value={dayPref.breakTime}
                        onChange={e => handleTimeChange(day, "breakTime", e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: Start-End (e.g. 12:00-13:00)
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyToAllDays(day)}
                      className="mt-2"
                    >
                      Apply to All Days
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tips for Effective Study Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>Schedule difficult subjects during your peak concentration times</li>
            <li>Include regular breaks to avoid burnout</li>
            <li>Try to maintain a consistent schedule from week to week</li>
            <li>Consider your natural energy levels throughout the day</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesForm;
