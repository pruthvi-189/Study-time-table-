
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { X, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { Activity, ActivityType } from "./TimetableGenerator";

interface ActivityFormProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

const colors = [
  "#9575cd", // Purple
  "#64b5f6", // Light blue
  "#81c784", // Green
  "#ffb74d", // Orange
  "#ff8a65", // Coral
  "#7986cb", // Indigo
  "#4fc3f7", // Sky blue
  "#aed581", // Light green
  "#ffd54f", // Amber
  "#ff7043", // Deep orange
];

const activityTypes: {value: ActivityType, label: string}[] = [
  { value: "sleep", label: "Sleep" },
  { value: "freshup", label: "Fresh-up/Morning Routine" },
  { value: "exercise", label: "Exercise" },
  { value: "school", label: "School" },
  { value: "study", label: "Study" },
  { value: "extracurricular", label: "Extra-curricular" },
  { value: "bedtime", label: "Evening Routine" }
];

const ActivityForm: React.FC<ActivityFormProps> = ({ activities, setActivities }) => {
  const [newActivity, setNewActivity] = useState<Activity>({
    id: "",
    name: "",
    type: "study",
    color: colors[0],
    hoursPerDay: 1,
    priority: 5,
    fixedTime: false,
  });
  
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddActivity = () => {
    if (!newActivity.name.trim()) {
      toast.error("Activity name cannot be empty");
      return;
    }

    if (newActivity.hoursPerDay <= 0) {
      toast.error("Hours per day must be greater than 0");
      return;
    }

    // Add new activity
    const activityToAdd = {
      ...newActivity,
      id: Date.now().toString(),
      color: newActivity.color || colors[activities.length % colors.length],
    };

    setActivities([...activities, activityToAdd]);
    
    // Reset form
    setNewActivity({
      id: "",
      name: "",
      type: "study",
      color: colors[(activities.length + 1) % colors.length],
      hoursPerDay: 1,
      priority: 5,
      fixedTime: false,
    });
    
    toast.success(`Activity "${activityToAdd.name}" added`);
    setIsDialogOpen(false);
  };

  const handleEditActivity = () => {
    if (!editingActivity) return;

    if (!editingActivity.name.trim()) {
      toast.error("Activity name cannot be empty");
      return;
    }

    if (editingActivity.hoursPerDay <= 0) {
      toast.error("Hours per day must be greater than 0");
      return;
    }

    setActivities(activities.map(a => a.id === editingActivity.id ? editingActivity : a));
    setEditingActivity(null);
    toast.success(`Activity "${editingActivity.name}" updated`);
    setIsDialogOpen(false);
  };

  const handleRemoveActivity = (id: string) => {
    const activityName = activities.find(a => a.id === id)?.name;
    setActivities(activities.filter(a => a.id !== id));
    toast.info(`Activity "${activityName}" removed`);
  };

  const startEdit = (activity: Activity) => {
    setEditingActivity({ ...activity });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Daily Activities</h2>
          <p className="text-gray-500 mt-1">
            Manage your daily schedule activities
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setEditingActivity(null);
                setNewActivity({
                  id: "",
                  name: "",
                  type: "study",
                  color: colors[activities.length % colors.length],
                  hoursPerDay: 1,
                  priority: 5,
                  fixedTime: false
                });
              }}
            >
              <Plus size={16} className="mr-1" /> Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingActivity ? "Edit Activity" : "Add New Activity"}
              </DialogTitle>
            </DialogHeader>
            <form 
              className="space-y-4 py-2" 
              onSubmit={(e) => {
                e.preventDefault();
                editingActivity ? handleEditActivity() : handleAddActivity();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="activityName">Activity Name</Label>
                <Input
                  id="activityName"
                  placeholder="e.g., Morning Exercise"
                  value={editingActivity ? editingActivity.name : newActivity.name}
                  onChange={(e) => {
                    if (editingActivity) {
                      setEditingActivity({ ...editingActivity, name: e.target.value });
                    } else {
                      setNewActivity({ ...newActivity, name: e.target.value });
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Select
                  value={editingActivity ? editingActivity.type : newActivity.type}
                  onValueChange={(value: ActivityType) => {
                    if (editingActivity) {
                      setEditingActivity({ ...editingActivity, type: value });
                    } else {
                      setNewActivity({ ...newActivity, type: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerDay">Hours Per Day</Label>
                <Input
                  id="hoursPerDay"
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={editingActivity ? editingActivity.hoursPerDay : newActivity.hoursPerDay}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 1;
                    if (editingActivity) {
                      setEditingActivity({ ...editingActivity, hoursPerDay: value });
                    } else {
                      setNewActivity({ ...newActivity, hoursPerDay: value });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={editingActivity ? editingActivity.priority : newActivity.priority}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 5;
                    if (editingActivity) {
                      setEditingActivity({ ...editingActivity, priority: value });
                    } else {
                      setNewActivity({ ...newActivity, priority: value });
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Higher number means higher priority</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fixedTime">Fixed Time</Label>
                  <p className="text-xs text-gray-500">Activity occurs at specific times</p>
                </div>
                <Switch
                  id="fixedTime"
                  checked={editingActivity ? editingActivity.fixedTime : newActivity.fixedTime}
                  onCheckedChange={(checked) => {
                    if (editingActivity) {
                      setEditingActivity({ ...editingActivity, fixedTime: checked });
                    } else {
                      setNewActivity({ ...newActivity, fixedTime: checked });
                    }
                  }}
                />
              </div>

              {(editingActivity ? editingActivity.fixedTime : newActivity.fixedTime) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time (HH:MM)</Label>
                    <Input
                      id="startTime"
                      placeholder="09:00"
                      value={editingActivity ? editingActivity.startTime || "" : newActivity.startTime || ""}
                      onChange={(e) => {
                        if (editingActivity) {
                          setEditingActivity({ ...editingActivity, startTime: e.target.value });
                        } else {
                          setNewActivity({ ...newActivity, startTime: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time (HH:MM)</Label>
                    <Input
                      id="endTime"
                      placeholder="10:00"
                      value={editingActivity ? editingActivity.endTime || "" : newActivity.endTime || ""}
                      onChange={(e) => {
                        if (editingActivity) {
                          setEditingActivity({ ...editingActivity, endTime: e.target.value });
                        } else {
                          setNewActivity({ ...newActivity, endTime: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${
                        (editingActivity ? editingActivity.color : newActivity.color) === color
                          ? "ring-2 ring-offset-2 ring-black scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        if (editingActivity) {
                          setEditingActivity({ ...editingActivity, color });
                        } else {
                          setNewActivity({ ...newActivity, color });
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
                  {editingActivity ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden">
            <div 
              className="h-2" 
              style={{ backgroundColor: activity.color }}
            />
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">{activity.name}</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(activity)}
                  >
                    <Edit size={16} />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveActivity(activity.id)}
                  >
                    <X size={16} />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1 space-y-1">
                <p>Type: {activityTypes.find(t => t.value === activity.type)?.label || activity.type}</p>
                <p>{activity.hoursPerDay} {activity.hoursPerDay === 1 ? "hour" : "hours"} per day</p>
                {activity.fixedTime && activity.startTime && activity.endTime && (
                  <p>Time: {activity.startTime} - {activity.endTime}</p>
                )}
                <p>Priority: {activity.priority}/10</p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {activities.length === 0 && (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No activities added yet. Add your first activity to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityForm;
