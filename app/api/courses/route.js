import mongoose from "mongoose";
import axios from "axios";
import { configDotenv } from "dotenv";

const MONGO_URI = process.env.MONGODB_ATLAS;
const API_URL = process.env.API_URL;

if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }


const courseSchema = new mongoose.Schema({
  data: [{
  id: String,
  title: String,
  gold: Number,
  silver: Number,
  average: Number,
  registered: Number,
  }],
  cacheTimestamp: Date,
});

const CourseModel = mongoose.models["nptels"] || mongoose.model("nptels", courseSchema);

console.log("MongoDB connection state:", mongoose.connection.readyState);



// Function to fetch course data and stats
const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
  
      let courseData = [];
  
      // Process the course data
      for (let i = 0; i < response.data.data.length; i++) {
        if (response.data.data[i].discipline_id === 106) {
          courseData.push({
            id: response.data.data[i].id,
            title: response.data.data[i].title,
          });
        }
      }
  
      console.log(courseData);
  
      // Fetch additional course stats
      const updatedCourses = await Promise.all(
        courseData.map(async (course) => {
          try {
            const statsResponse = await axios.get(
              `https://tools.nptel.ac.in/npteldata/stats.php?id=${course.id}`
            );
  
            let totalGold = 0;
            let totalSilver = 0;
            let totalRegistered = 0;
            let totalMarks = 0;
  
            for (let j = 0; j < statsResponse.data.data[0].run_wise_stats.length; j++) {
              totalGold += parseInt(statsResponse.data.data[0].run_wise_stats[j].Gold, 10) || 0;
              totalSilver += parseInt(statsResponse.data.data[0].run_wise_stats[j].Silver, 10) || 0;
              totalRegistered += parseInt(statsResponse.data.data[0].run_wise_stats[j].Registered, 10) || 0;
              totalMarks += parseInt(statsResponse.data.data[0].run_wise_stats[j].average * statsResponse.data.data[0].run_wise_stats[j].Registered, 10) || 0;
            }
  
            return {
              id: course.id,
              title: course.title,
              gold: totalGold || -1,
              silver: totalSilver || -1,
              average: totalMarks / totalRegistered || -1,
              registered: totalRegistered || -1,
            };
          } catch (err) {
            console.error(`Error fetching stats for course ${course.id}:`, err);
            return {
              id: course.id,
              title: course.title,
              gold: -1,
              silver: -1,
              average: -1,
              registered: -1,
            };
          }
        })
      );
  
      updatedCourses.sort((a, b) => (b.average || 0) - (a.average || 0));
      return updatedCourses;
  
    } catch (err) {
      console.error("Error fetching course data:", err);
      return [];
    }
  };
  
  // Main API GET handler
  export async function GET() {
    try {
      // Check if data already exists and is recent
      const data = await CourseModel.findOne({
        cacheTimestamp: { $gte: new Date() - 60*24 * 60 * 60 * 1000 },
      });
      
      if (data) {
        // If data is available and recent, return it
        return new Response(JSON.stringify(data.data), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
      
  
      // If no recent data, fetch new data
      const updatedCourses = await fetchData();

      const newData = new CourseModel({
        data: updatedCourses,
        cacheTimestamp: new Date(),
      });
  
      await newData.save();
  
      if (updatedCourses.length === 0) {
        // If no courses were fetched, return an error
        return new Response(
          JSON.stringify({ message: "Failed to fetch course data" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
  
      // Save the newly fetched data into the database
      
  
      // Return the saved data as JSON response
      return new Response(JSON.stringify(updatedCourses), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
  
    } catch (error) {
      console.error("Error processing course data:", error);
      return new Response(
        JSON.stringify({ message: "Failed to process course data", error: error.message }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  }
  
