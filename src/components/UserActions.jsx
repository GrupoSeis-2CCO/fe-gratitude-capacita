import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "./ActionButton";

export default function UserActions() {
  const navigate = useNavigate();
  const params = useParams();
  const idAluno = params.id ?? params.idUsuario ?? params.idAluno;

  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sobre o Participante</h2>
      <div className="space-y-4">
        <ActionButton
          icon="📄"
          text="Provas Realizadas"
          onClick={() => navigate(`/participantes/${idAluno}/avaliacoes`)}
        />
        <ActionButton
          icon="📚"
          text="Cursos do Participante"
          onClick={() => navigate(`/participantes/${idAluno}/cursos`)}
        />
        <ActionButton
          icon="🗑️"
          text="Apagar Usuário"
          variant="danger"
          onClick={() => console.log("Apagar Usuário clicado")}
        />
      </div>
    </div>
  );
}
