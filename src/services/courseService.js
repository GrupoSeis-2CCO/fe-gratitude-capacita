import api from "./api.js";

export async function getCourses() {
  const { data } = await api.get("/cursos");
  return data;
}
