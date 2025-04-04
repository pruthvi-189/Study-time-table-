import React, { useState, useEffect } from "react";
import TimetableGenerator from "../components/TimetableGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

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

const studentSchedules = [
  {
    name: "High School Student",
    schedule: sampleDaySchedule
  },
  {
    name: "College Student",
    schedule: [
      { time: "07:00 - 08:00", activity: "Wake up & Morning Routine", type: "freshup", color: "#64b5f6" },
      { time: "08:00 - 09:00", activity: "Breakfast & Commute", type: "freshup", color: "#64b5f6" },
      { time: "09:00 - 12:00", activity: "Morning Classes", type: "school", color: "#ffb74d" },
      { time: "12:00 - 13:00", activity: "Lunch Break", type: "break", color: "#f0f0f0" },
      { time: "13:00 - 16:00", activity: "Afternoon Classes/Lab", type: "school", color: "#ffb74d" },
      { time: "16:00 - 18:00", activity: "Study Group", type: "study", color: "#ef5350" },
      { time: "18:00 - 19:00", activity: "Dinner", type: "break", color: "#f0f0f0" },
      { time: "19:00 - 21:00", activity: "Independent Study", type: "study", color: "#ab47bc" },
      { time: "21:00 - 23:00", activity: "Social Activities", type: "extracurricular", color: "#ff8a65" },
      { time: "23:00 - 07:00", activity: "Sleep", type: "sleep", color: "#9575cd" },
    ]
  },
  {
    name: "Working Professional",
    schedule: [
      { time: "06:30 - 07:30", activity: "Wake up & Morning Routine", type: "freshup", color: "#64b5f6" },
      { time: "07:30 - 08:30", activity: "Exercise", type: "exercise", color: "#81c784" },
      { time: "08:30 - 09:00", activity: "Breakfast", type: "break", color: "#f0f0f0" },
      { time: "09:00 - 17:00", activity: "Work Hours", type: "school", color: "#ffb74d" },
      { time: "17:00 - 18:00", activity: "Commute & Relax", type: "break", color: "#f0f0f0" },
      { time: "18:00 - 19:00", activity: "Dinner", type: "break", color: "#f0f0f0" },
      { time: "19:00 - 20:00", activity: "Online Course", type: "study", color: "#ef5350" },
      { time: "20:00 - 22:00", activity: "Hobby/Social", type: "extracurricular", color: "#ff8a65" },
      { time: "22:00 - 23:00", activity: "Evening Routine", type: "bedtime", color: "#7986cb" },
      { time: "23:00 - 06:30", activity: "Sleep", type: "sleep", color: "#9575cd" },
    ]
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("highschool");
  const [currentSchedule, setCurrentSchedule] = useState(studentSchedules[0].schedule);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    if (activeTab === "highschool") {
      setCurrentSchedule(studentSchedules[0].schedule);
    } else if (activeTab === "college") {
      setCurrentSchedule(studentSchedules[1].schedule);
    } else {
      setCurrentSchedule(studentSchedules[2].schedule);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <header className="py-16 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0, 0.71, 0.2, 1.01]
            }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 2.5, 
                ease: "easeInOut", 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              Daily Schedule Planner
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              Plan your entire day from wake-up to bedtime
            </motion.p>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8 shadow-md border-2 border-purple-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
              <CardTitle className="text-xl font-bold text-gray-800">
                Sample Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="highschool" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3 rounded-none">
                  <TabsTrigger value="highschool">High School Student</TabsTrigger>
                  <TabsTrigger value="college">College Student</TabsTrigger>
                  <TabsTrigger value="professional">Working Professional</TabsTrigger>
                </TabsList>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4">Time</TableHead>
                          <TableHead>Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSchedule.map((item, index) => (
                          <TableRow key={index} className="transition-colors hover:bg-gray-50">
                            <TableCell className="font-medium">{item.time}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
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
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center"
        >
          {!showGenerator ? (
            <div className="text-center py-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                Ready to create your own schedule?
              </h2>
              <p className="text-gray-600 mb-6">
                Our schedule generator helps you organize your day for maximum productivity
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-md hover:bg-purple-700 transition-colors"
                onClick={() => setShowGenerator(true)}
              >
                Create My Schedule
              </motion.button>
            </div>
          ) : (
            <TimetableGenerator />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
