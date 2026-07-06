import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Target, Eye, Heart, Calendar, Users } from 'lucide-react';

export default function QuemSomos() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-8">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
            Quem <span className="text-blue-600">Somos</span>
          </h1>
          <Card className="mb-4 md:mb-2">
            <div className="flex items-start gap-2 md:gap-2">
              <h1 className="text-sm md:text-lg font-bold mb-8 md:mb-12 text-center max-w-3xl mx-auto">
                Conheça a CPTrans - Companhia Petropolitana de Trânsito e
                Transporte.
              </h1>
            </div>
          </Card>
        </div>
      </section>

      {/* Sobre a CPTrans */}
      <section className="container mx-auto px-4 py-8 md:py-8">
        <div className="w-full max-w-5xl mx-auto">
          <Card className="mb-8 md:mb-12">
            <CardContent className="p-4 md:p-8">
              <div className="flex items-start gap-4 md:gap-6">
                <Building className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    Sobre a CPTrans
                  </p>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600">
                    <p>
                      A CPTrans é uma empresa pública municipal dedicada ao
                      planejamento, gestão e fiscalização do sistema de
                      transporte da cidade.
                    </p>
                    <p>
                      Atuamos com o compromisso de desenvolver soluções
                      inovadoras que atendam às necessidades de mobilidade
                      urbana, sempre priorizando a eficiência, segurança e
                      sustentabilidade.
                    </p>
                    <p>
                      No setor de carga e descarga, implementamos sistemas
                      digitais que facilitam o agendamento e gestão das áreas
                      destinadas a estas operações, contribuindo para a
                      organização do trânsito e o desenvolvimento econômico
                      local.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Nossos Pilares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: Target,
                title: 'Missão',
                description:
                  'Otimizar a gestão do transporte municipal através de soluções inovadoras, garantindo eficiência e segurança nas operações de carga e descarga.',
              },
              {
                icon: Eye,
                title: 'Visão',
                description:
                  'Ser referência nacional em gestão de transporte urbano, promovendo mobilidade sustentável e contribuindo para o desenvolvimento econômico da cidade.',
              },
              {
                icon: Heart,
                title: 'Valores',
                description:
                  'Transparência, eficiência, inovação tecnológica, compromisso com o cidadão e desenvolvimento sustentável.',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex justify-center">
                    <item.icon className="h-8 w-8 md:h-12 md:w-12 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-5xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Nossa História
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">
                        Fundação e Evolução
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Criada para modernizar a gestão do transporte municipal,
                        a CPTrans tem evoluído constantemente, incorporando
                        tecnologias avançadas para melhor atender às
                        necessidades da população e do setor empresarial.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">
                        Compromisso Social
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Trabalhamos em parceria com a comunidade, empresas e
                        órgãos públicos para desenvolver soluções que equilibrem
                        as necessidades do transporte com a qualidade de vida
                        urbana.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Compromisso com a Inovação */}
      <section className="bg-blue-600 text-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-5xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
              Compromisso com a Inovação
            </h2>
            <p className="text-blue-100 text-sm md:text-base mb-6 md:mb-8 max-w-2xl mx-auto">
              Investimos continuamente em tecnologia para oferecer soluções
              digitais que simplifiquem o agendamento e gestão das áreas de
              carga e descarga, promovendo mais eficiência e transparência para
              todos os usuários.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
