
import React from "react";
import TimetableGenerator from "../components/TimetableGenerator";

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
      <TimetableGenerator />
    </div>
  );
};

export default Index;
