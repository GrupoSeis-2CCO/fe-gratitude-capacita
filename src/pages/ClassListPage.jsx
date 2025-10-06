import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddCourseSection from "../components/AddCourseSection.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { getCourses } from "../services/courseService.js";

export default function ClassListPage() {
  const { getCurrentUserType } = useAuth();
  const userType = getCurrentUserType();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        const data = await getCourses();
        if (!isMounted) return;
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        if (!isMounted) return;
        setCourses([]);
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-10">
          <TituloPrincipal>Cursos de Capacitação</TituloPrincipal>
        </div>

        <AddCourseSection />

        <div className="mt-8 w-full">
          {courses.map((course) => {
            const normalizedCourse = {
              ...course,
              stats: course.stats ?? {
                materials: course.materials ?? "00",
                students: course.students ?? "00",
                hours: course.hours ?? "00:00h",
              },
            };

            return (
              <CourseCard
                key={normalizedCourse.id}
                course={normalizedCourse}
                onClick={() => navigate(`/cursos/${normalizedCourse.id}`)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
