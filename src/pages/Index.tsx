
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

  // Animation variants for floating effect
  const floatingAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden relative">
      {/* Animated background shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-300/30 blur-2xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-blue-300/30 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-pink-300/20 blur-2xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <header className="py-16 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 shadow-lg relative overflow-hidden">
        {/* Header background effects */}
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-10 w-60 h-60 rounded-full bg-white/5"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -15, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
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
              className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg"
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
              className="text-xl md:text-2xl text-white/90 font-light"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              Plan your entire day from wake-up to bedtime
            </motion.p>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            animate={floatingAnimation}
            className="mb-10"
          >
            <Card className="mb-8 shadow-xl border-2 border-purple-100 overflow-hidden backdrop-blur-sm bg-white/80">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <motion.span
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                    }}
                    className="mr-2"
                  >
                    ✨
                  </motion.span>
                  Sample Schedules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="highschool" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-3 rounded-none bg-gradient-to-r from-purple-100/50 to-blue-100/50">
                    <TabsTrigger value="highschool" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-md">High School Student</TabsTrigger>
                    <TabsTrigger value="college" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-md">College Student</TabsTrigger>
                    <TabsTrigger value="professional" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-md">Working Professional</TabsTrigger>
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
                            <motion.tr
                              key={index}
                              className="border-b transition-colors hover:bg-gray-50"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <TableCell className="font-medium">{item.time}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <motion.div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: item.color }}
                                    whileHover={{ scale: 1.5 }}
                                  />
                                  {item.activity}
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <motion.p 
                      className="text-sm text-gray-600 mt-4"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      This is just a sample schedule. Create your own personalized daily timetable using the generator below.
                    </motion.p>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center"
        >
          {!showGenerator ? (
            <motion.div 
              className="text-center py-8 px-6 rounded-2xl bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm shadow-xl border border-white/20"
              animate={floatingAnimation}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                Ready to create your own schedule?
              </h2>
              <p className="text-gray-600 mb-6">
                Our schedule generator helps you organize your day for maximum productivity
              </p>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#6d28d9" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition-colors"
                onClick={() => setShowGenerator(true)}
              >
                <motion.span 
                  className="inline-block"
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  ✨
                </motion.span> 
                Create My Schedule
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <TimetableGenerator />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
