import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "./ActionButton";

export default function UserActions({ expanded = false }) {
  const navigate = useNavigate();
  const params = useParams();
  const idAluno = params.id ?? params.idUsuario ?? params.idAluno;

  // quando expanded = true, usamos maiores espaçamentos/ícones
  const size = expanded ? 'large' : 'compact';
  const gapClass = expanded ? 'space-y-4' : 'space-y-2';

  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sobre o Participante</h2>
      <div className={gapClass}>
        <ActionButton
          icon="📄"
          text="Provas Realizadas"
          onClick={() => navigate(`/participantes/${idAluno}/avaliacoes`)}
          size={size}
        />
        <ActionButton
          icon="📚"
          text="Cursos do Participante"
          onClick={() => navigate(`/participantes/${idAluno}/cursos`)}
          size={size}
        />
        <ActionButton
          icon="🗑️"
          text="Apagar Usuário"
          variant="danger"
          onClick={() => console.log("Apagar Usuário clicado")}
          size={size}
        />
      </div>
    </div>
  );
}
