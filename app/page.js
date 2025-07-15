"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [allcourses, setAllCourses] = useState([{}]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /*  const fetchData = async () => {
    try {
      const response = await axios.get("/api/assets/course.json");
      let courseData=[];
      for(let i=0;i<response.data.data.length;i++){
        if(response.data.data[i].discipline_id===106){
          courseData.push({
            id: response.data.data[i].id,
            title: response.data.data[i].title,
          })
        }
      }

      console.log(courseData);

      

      const updatedCourses = await Promise.all(
        courseData.map(async (course) => {
          try {
            const statsResponse = await axios.get(
             `https://tools.nptel.ac.in/npteldata/stats.php?id=${course.id}`
            );

            let totalGold=0;
            let totalSilver=0;
            let totalRegistered=0;
            let totalMarks=0;

            for(let j=0;j<statsResponse.data.data[0].run_wise_stats.length;j++){
              totalGold += parseInt(statsResponse.data.data[0].run_wise_stats[j].Gold, 10) || 0;
              totalSilver += parseInt(statsResponse.data.data[0].run_wise_stats[j].Silver, 10) || 0;
              totalRegistered += parseInt(statsResponse.data.data[0].run_wise_stats[j].Registered, 10) || 0;
              totalMarks += parseInt(statsResponse.data.data[0].run_wise_stats[j].average*statsResponse.data.data[0].run_wise_stats[j].Registered, 10) || 0;
            }

            

            return {
              id: course.id,
              title: course.title,
              gold: totalGold || "N/A",
              silver: totalSilver || "N/A",
              average: totalMarks/totalRegistered|| 0,
              registered: totalRegistered|| "N/A",
            };
          } catch (err) {
            console.error(`Error fetching stats for course ${course.id}:`, err);
            return {
              id: course.id,
              title: course.title,
              gold: "N/A",
              silver: "N/A",
              average: 0,
              registered: "NA",
            };
          }
        })
      );
      updatedCourses.sort((a, b) => (b.average || 0) - (a.average || 0));
      setCourses(updatedCourses); 
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error("Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  };  */

  const handleComputerClick=()=>{
    const filteredCourses = allcourses.filter(course => course.dept === "Computer Science" );
    setCourses(filteredCourses[0].data);
  }

  const handleOtherClick=()=>{
    const filteredCourses = allcourses.filter(course => course.dept === "Other" );
    setCourses(filteredCourses[0].data);
  }



  const fetchData = async () => {
    try {
      const response = await axios.get("/api/courses");
      setAllCourses(response.data);
      const filteredCourses = response.data.filter(course => course.dept === 'Computer Science' );
      console.log(filteredCourses);
    setCourses(filteredCourses[0].data);
      
    }
    catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error("Error fetching course data:", err);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>NPTEL Stats </h1>
      <div className="button-container">
      <button className="choice-button" onClick={handleComputerClick}>Computer Science</button>
      <button className="choice-button" onClick={handleOtherClick}>Other</button>
    </div>


      {error && <p className="error">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Total Registered</th>
              <th>Average</th>
              <th>Gold Participants (90+)</th>
              <th>Silver Participants (75+)</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={index}>
                  <td className="course-title"><a href={`https://nptel.ac.in/courses/${course.id}`} target="_blank" rel="noopener noreferrer">{course.title}</a></td>
                  <td className="gold">{course.registered >= 0 ? course.registered : "NA"}</td>
                  <td className="gold">{course.average >= 0 ? course.average : "NA"}</td>
                  <td className="gold">{course.gold >= 0 ? ((course.gold * 100) / course.registered).toFixed(2) : "NA"} % </td>
                  <td className="gold">{course.silver >= 0 ? ((course.silver * 100) / course.registered).toFixed(2) : "NA"} %</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
