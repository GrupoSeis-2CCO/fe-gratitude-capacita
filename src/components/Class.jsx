import '../styles/Class.css'

function Class(props) {
    return (
        <>
            <h1 className='Title'>{props.title}</h1>
            <div className='Class'>
                <img src={props.image} alt={props.imageDescription} />
                <section className='Section Description'>
                    <h3>Conteúdo</h3>
                    <p>{props.description}</p>
                </section>

                <section className='Section Infos'>
                    <label>Quantidade de Materiais - {props.materials}</label> 
                    <label>Quantidade de Alunos - {props.students}</label> 
                    <label>Total de Horas - {props.hours}</label> 
                </section>
                
            </div>
        </>
    )
}

export default Class;