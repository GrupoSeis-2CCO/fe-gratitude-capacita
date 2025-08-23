import ActionButton from "./ActionButton";

export default function UserActions() {
  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sobre o Participante</h2>
      <div className="space-y-4">
        <ActionButton
          icon="📄"
          text="Provas Realizadas"
          onClick={() => console.log("Provas Realizadas clicado")}
        />
        <ActionButton
          icon="📚"
          text="Cursos do Participante"
          onClick={() => console.log("Cursos do Participante clicado")}
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
