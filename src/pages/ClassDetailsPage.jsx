import { useParams } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';

function ClassDetailsPage() {
    const { idCurso } = useParams();
    
    return (
        <>
            {/* Timeline indicators - Left side */}
             <div className="absolute left-50 top-2/3 transform -translate-y-1/2 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="w-0.5 h-140 bg-gradient-to-b from-orange-500 to-blue-500"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
            </div>

            {/* Timeline indicators - Right side */}
            <div className="absolute right-50 top-2/3 transform -translate-y-1/2 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="w-0.5 h-140 bg-gradient-to-b from-orange-500 to-blue-500"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50 relative">
                <Header />
                
                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Cursos de Capacitação</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto mt-2"></div>
                    </div>

                    {/* Course Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Course Title */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Curso {idCurso}</h3>
                        </div>

                        {/* Course Image */}
                        <div className="px-6 py-4">
                            <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="px-6 py-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Conteúdo</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vestibulum lectus
                                et est pharetra, id congue mauris molestie. Nulla sed ipsum non mauris commodo
                                vehicula sit amet quis massa. Nam id ipsum ac sapien posuere molestie a sed
                                mauris. Ut vehicula est odio, a pharetra magna vestibulum sit amet. Etiam ut
                                dignissim nibh, non eleifend dui. Sed a tellus ac quam pellentesque ultrices at vel
                                purus. Vestibulum quis consectetur lectus.
                            </p>
                        </div>

                        {/* Metrics Section */}
                        <div className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">15</div>
                                    <div className="text-sm text-gray-600">Quantidade de Alunos</div>
                                </div>
                                <div className="text-center border-l border-r border-gray-300">
                                    <div className="text-2xl font-bold text-gray-800">2:30:00</div>
                                    <div className="text-sm text-gray-600">Total de Horas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">5</div>
                                    <div className="text-sm text-gray-600">Quantidade de Materiais</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 py-6 bg-white">
                            <div className="grid grid-cols-3 gap-4">
                                <Button 
                                    variant="Default" 
                                    label="Ver Alunos e Desempenho"
                                    onClick={() => {}} 
                                />
                                <Button 
                                    variant="Default" 
                                    label="Analisar Feedbacks"
                                    onClick={() => {}} 
                                />
                                <Button 
                                    variant="Default" 
                                    label="Visualizar Materiais do Curso"
                                    onClick={() => {}} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ClassDetailsPage;
