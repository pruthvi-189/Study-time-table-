
import React from "react";
import TimetableGenerator from "../components/TimetableGenerator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleDaySchedule = [
  { time: "06:00 - 07:00", activity: "Wake up & Morning Routine", type: "freshup", color: "#64b5f6" },
  { time: "07:00 - 07:30", activity: "Exercise", type: "exercise", color: "#81c784" },
  { time: "07:30 - 08:00", activity: "Breakfast & Get Ready", type: "freshup", color: "#64b5f6" },
  { time: "08:00 - 15:00", activity: "School", type: "school", color: "#ffb74d" },
  { time: "15:00 - 16:00", activity: "Break & Snack", type: "break", color: "#f0f0f0" },
  { time: "16:00 - 17:00", activity: "Math Study", type: "study", color: "#ef5350" },
  { time: "17:00 - 18:00", activity: "Science Study", type: "study", color: "#ab47bc" },
  { time: "18:00 - 19:00", activity: "Dinner", type: "break", color: "#f0f0f0" },
  { time: "19:00 - 21:00", activity: "Extra-curricular Activity", type: "extracurricular", color: "#ff8a65" },
  { time: "21:00 - 22:00", activity: "Evening Routine", type: "bedtime", color: "#7986cb" },
  { time: "22:00 - 06:00", activity: "Sleep", type: "sleep", color: "#9575cd" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Daily Schedule Planner
          </h1>
          <p className="text-gray-600">
            Plan your entire day from wake-up to bedtime
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sample Student Daily Schedule</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Time</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleDaySchedule.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          {item.activity}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              This is just a sample schedule. Create your own personalized daily timetable using the generator below.
            </p>
          </CardContent>
        </Card>
      </div>
      <TimetableGenerator />
    </div>
  );
};

export default Index;
