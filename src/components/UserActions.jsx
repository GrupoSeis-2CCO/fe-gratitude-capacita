import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "./ActionButton";
import ConfirmModal from "./ConfirmModal";
import userService from "../services/UserService";
import { useState } from "react";

export default function UserActions({ expanded = false, userName }) {
  const navigate = useNavigate();
  const params = useParams();
  const idAluno = params.id ?? params.idUsuario ?? params.idAluno;
  const idCurso = params.idCurso ?? params.cursoId;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onDeleteClick = () => setConfirmOpen(true);

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await userService.delete(idAluno);
      // Dispara toast de sucesso com o nome do usuário e volta para histórico de acessos
      const display = userName && String(userName).trim().length > 0 ? userName : `ID ${idAluno}`;
      try {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              type: 'success',
              title: 'Usuário apagado',
              message: `O usuário ${display} foi removido.`,
              duration: 3500
            }
          })
        );
      } catch (_) {
        // noop – fallback apenas navega
      }
      navigate(`/acessos`);
    } catch (e) {
      console.error("Falha ao apagar usuário:", e);
      alert("Não foi possível apagar o usuário. Verifique e tente novamente.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  // quando expanded = true, usamos maiores espaçamentos/ícones
  const size = expanded ? 'large' : 'compact';
  const gapClass = expanded ? 'space-y-4' : 'space-y-2';

  return (
    <div className="lg:col-span-1">
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
          onClick={onDeleteClick}
          size={size}
        />
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={deleting ? "Apagando usuário..." : "Confirmar exclusão"}
        message={
          deleting
            ? "Removendo usuário, por favor aguarde."
            : "Tem certeza que deseja apagar este usuário? Essa ação é irreversível."
        }
        onCancel={() => (!deleting ? setConfirmOpen(false) : null)}
        onConfirm={handleConfirmDelete}
        confirmLabel={deleting ? "Apagando..." : "Apagar"}
        cancelLabel="Cancelar"
        tone="orange"
      />
    </div>
  );
}
