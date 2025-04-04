
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Subject } from "./TimetableGenerator";

interface SubjectFormProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ subjects, setSubjects }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ef5350");
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [fixedTime, setFixedTime] = useState(false);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  
  const defaultColors = [
    "#ef5350", "#ab47bc", "#7e57c2", "#5c6bc0", 
    "#42a5f5", "#26c6da", "#26a69a", "#66bb6a",
    "#ffa726", "#ff7043", "#8d6e63", "#78909c"
  ];

  const addSubject = () => {
    if (!name) {
      toast.error("Subject name is required");
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      color,
      hoursPerWeek,
      fixedTime,
      startTime: fixedTime ? startTime : undefined,
      endTime: fixedTime ? endTime : undefined
    };

    setSubjects([...subjects, newSubject]);
    toast.success(`${name} added to your subjects`);
    
    // Reset form
    setName("");
    setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
    setHoursPerWeek(5);
    setFixedTime(false);
    setStartTime("15:00");
    setEndTime("16:00");
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    toast.success("Subject deleted");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input 
              id="subject-name"
              placeholder="e.g., Mathematics" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="subject-hours">Hours per Week</Label>
            <Input 
              id="subject-hours"
              type="number" 
              min="1" 
              max="20"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="subject-color">Color</Label>
            <div className="flex space-x-2">
              <Input 
                id="subject-color"
                type="color" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <div className="flex flex-wrap gap-2">
                {defaultColors.map(defaultColor => (
                  <button
                    key={defaultColor}
                    type="button"
                    onClick={() => setColor(defaultColor)}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: defaultColor }}
                    aria-label={`Select color ${defaultColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="fixed-time"
              checked={fixedTime}
              onCheckedChange={setFixedTime}
            />
            <Label htmlFor="fixed-time">Fixed Time Schedule</Label>
          </div>
          
          {fixedTime && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input 
                  id="start-time"
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input 
                  id="end-time"
                  type="time" 
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
          
          <Button 
            onClick={addSubject} 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
          >
            Add Subject
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Your Subjects</h3>
          
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No subjects added yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {subjects.map(subject => (
                <div 
                  key={subject.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-gray-500">
                        {subject.hoursPerWeek} hours/week
                        {subject.fixedTime && subject.startTime && subject.endTime && (
                          <span> • Fixed: {subject.startTime} - {subject.endTime}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubject(subject.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectForm;
