
function Class(props) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h1 className='text-2xl font-bold text-gray-800 mb-4 px-6 pt-6'>{props.title}</h1>
            <div className='flex flex-col md:flex-row gap-6 p-6'>
                <img 
                    src={props.image} 
                    alt={props.imageDescription} 
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                />
                
                <div className="flex-1 space-y-4">
                    <section className='space-y-2'>
                        <h3 className="text-lg font-semibold text-gray-700">Conteúdo</h3>
                        <p className="text-gray-600 leading-relaxed">{props.description}</p>
                    </section>

                    <section className='space-y-2'>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded-md">
                                <span className="font-medium text-blue-700">Materiais:</span>
                                <span className="ml-2 text-blue-600">{props.materials}</span>
                            </div>
                            <div className="bg-green-50 p-3 rounded-md">
                                <span className="font-medium text-green-700">Alunos:</span>
                                <span className="ml-2 text-green-600">{props.students}</span>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-md">
                                <span className="font-medium text-purple-700">Horas:</span>
                                <span className="ml-2 text-purple-600">{props.hours}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Class;