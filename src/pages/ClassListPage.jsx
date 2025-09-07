import React from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddCourseSection from "../components/AddCourseSection.jsx";
import CourseCard from "../components/CourseCard.jsx";

export default function ClassListPage() {
	const mockCourses = [
		{
			id: 1,
			title: "Curso x",
			imageUrl: "https://via.placeholder.com/192x128",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit consec adiscing elasit.",
			stats: {
				materials: 5,
				students: 23,
				hours: "10:00h"
			}
		},
		{
			id: 2,
			title: "Curso y",
			imageUrl: "https://via.placeholder.com/192x128",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit consec adiscing elasit.",
			stats: {
				materials: 8,
				students: 15,
				hours: "08:30h"
			}
		},
		{
			id: 3,
			title: "Curso z",
			imageUrl: "https://via.placeholder.com/192x128",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit consec adiscing elasit.",
			stats: {
				materials: 12,
				students: 30,
				hours: "22:00h"
			}
		}
	];

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-10">
					<TituloPrincipal>Cursos de Capacitação</TituloPrincipal>
				</div>

				<AddCourseSection />

				<div className="mt-8 w-full">
					{mockCourses.map(course => (
						<CourseCard key={course.id} course={course} />
					))}
				</div>
			</div>

		</div>
	);
}
