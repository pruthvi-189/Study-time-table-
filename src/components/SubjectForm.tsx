
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { X, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { Subject } from "./TimetableGenerator";

interface SubjectFormProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

const colors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFD166", // Yellow
  "#6A0572", // Purple
  "#FF8C42", // Orange
  "#06D6A0", // Green
  "#118AB2", // Blue
  "#9D4EDD", // Lavender
  "#FF5964", // Coral
  "#17A398", // Turquoise
];

const SubjectForm: React.FC<SubjectFormProps> = ({ subjects, setSubjects }) => {
  const [newSubject, setNewSubject] = useState<Subject>({
    id: "",
    name: "",
    color: colors[0],
    hoursPerWeek: 1,
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      toast.error("Subject name cannot be empty");
      return;
    }

    if (newSubject.hoursPerWeek <= 0) {
      toast.error("Hours per week must be greater than 0");
      return;
    }

    // Add new subject
    const subjectToAdd = {
      ...newSubject,
      id: Date.now().toString(),
      color: newSubject.color || colors[subjects.length % colors.length],
    };

    setSubjects([...subjects, subjectToAdd]);
    
    // Reset form
    setNewSubject({
      id: "",
      name: "",
      color: colors[(subjects.length + 1) % colors.length],
      hoursPerWeek: 1,
    });
    
    toast.success(`Subject "${subjectToAdd.name}" added`);
    setIsDialogOpen(false);
  };

  const handleEditSubject = () => {
    if (!editingSubject) return;

    if (!editingSubject.name.trim()) {
      toast.error("Subject name cannot be empty");
      return;
    }

    if (editingSubject.hoursPerWeek <= 0) {
      toast.error("Hours per week must be greater than 0");
      return;
    }

    setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
    setEditingSubject(null);
    toast.success(`Subject "${editingSubject.name}" updated`);
    setIsDialogOpen(false);
  };

  const handleRemoveSubject = (id: string) => {
    const subjectName = subjects.find(s => s.id === id)?.name;
    setSubjects(subjects.filter(s => s.id !== id));
    toast.info(`Subject "${subjectName}" removed`);
  };

  const startEdit = (subject: Subject) => {
    setEditingSubject({ ...subject });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">My Subjects</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setEditingSubject(null);
                setNewSubject({
                  id: "",
                  name: "",
                  color: colors[subjects.length % colors.length],
                  hoursPerWeek: 1,
                });
              }}
            >
              <Plus size={16} className="mr-1" /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
            </DialogHeader>
            <form 
              className="space-y-4 py-2" 
              onSubmit={(e) => {
                e.preventDefault();
                editingSubject ? handleEditSubject() : handleAddSubject();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  placeholder="e.g., Mathematics"
                  value={editingSubject ? editingSubject.name : newSubject.name}
                  onChange={(e) => {
                    if (editingSubject) {
                      setEditingSubject({ ...editingSubject, name: e.target.value });
                    } else {
                      setNewSubject({ ...newSubject, name: e.target.value });
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Study Hours Per Week</Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  min="1"
                  max="40"
                  value={editingSubject ? editingSubject.hoursPerWeek : newSubject.hoursPerWeek}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (editingSubject) {
                      setEditingSubject({ ...editingSubject, hoursPerWeek: value });
                    } else {
                      setNewSubject({ ...newSubject, hoursPerWeek: value });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${
                        (editingSubject ? editingSubject.color : newSubject.color) === color
                          ? "ring-2 ring-offset-2 ring-black scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        if (editingSubject) {
                          setEditingSubject({ ...editingSubject, color });
                        } else {
                          setNewSubject({ ...newSubject, color });
                        }
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {editingSubject ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No subjects added yet. Add your first subject to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden">
              <div 
                className="h-2" 
                style={{ backgroundColor: subject.color }}
              />
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">{subject.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(subject)}
                    >
                      <Edit size={16} />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSubject(subject.id)}
                    >
                      <X size={16} />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {subject.hoursPerWeek} {subject.hoursPerWeek === 1 ? "hour" : "hours"} per week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectForm;
