import api from "../provider/Api.js";

export async function getCourses() {
  const { data } = await api.get("/cursos");
  return data;
}
