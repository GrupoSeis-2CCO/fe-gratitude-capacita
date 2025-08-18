import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/UserExamsPage.css';

interface UserExamsPageProps {}

const UserExamsPage: React.FC<UserExamsPageProps> = () => {
  const { idUsuario } = useParams<{ idUsuario: string }>();

  return (
    <div className="user-exams-page">
      <div className="page-title">
        <div className="title-background"></div>
        <div className="title-text">Avaliação Curso 1 - Introdução</div>
      </div>

      <div className="side-line-group-left">
        <div className="side-line"></div>
        <div className="ellipse-top-left"></div>
        <div className="ellipse-bottom-left"></div>
      </div>

      <div className="side-line-group-right">
        <div className="side-line-right"></div>
        <div className="ellipse-top-right"></div>
        <div className="ellipse-bottom-right"></div>
      </div>

      {/* Question Title */}
      <div className="question-title">Questão 1</div>

      {/* Question Component */}
      <div className="question-component">
        <div className="question-background"></div>
        <div className="add-question-button">
          <div className="add-question-bg"></div>
          <div className="add-question-text">Adicionar Pergunta</div>
        </div>
      </div>

      {/* Main Component */}
      <div className="main-component">
        <div className="main-background"></div>
        
        {/* Action Buttons */}
        <div className="minimum-score-button">
          <div className="minimum-score-bg"></div>
          <div className="minimum-score-text">Inserir acertos mínimos</div>
        </div>

        <div className="complete-button">
          <div className="complete-bg"></div>
          <div className="complete-text">Concluir</div>
        </div>

        <div className="delete-button">
          <div className="delete-bg"></div>
          <div className="delete-text">Excluir</div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {/* Content will be added here */}
        </div>
      </div>

      {/* Footer */}
      <div className="footer"></div>
    </div>
  );
};

export default UserExamsPage;
