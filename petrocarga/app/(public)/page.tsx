'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redireciona conforme a permissão
      switch (user.permissao) {
        case 'ADMIN':
        case 'GESTOR':
          router.replace('/gestor/visualizar-vagas');
          break;
        case 'MOTORISTA':
          router.replace('/motorista/reservar-vaga');
          break;
        case 'AGENTE':
          router.replace('/agente/reserva-rapida');
          break;
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // Enquanto o /me está sendo carregado
  if (loading) return null;

  // Se já estiver logado, nem renderiza a Home (vai redirecionar)
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Seção da Hero */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="w-full max-w-5xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            Reserva de Áreas de
            <span className="text-blue-600"> Carga e Descarga</span>
          </h1>
          <p className="text-sm md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Sistema oficial da CPTrans para reserva e gestão de áreas destinadas
            à carga e descarga no município
          </p>
          <div className="flex flex-col sm:flex-row justify-center">
            <Link href="/autorizacao/login">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base"
              >
                Fazer Reserva
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {[
              {
                icon: Calendar,
                title: 'Agendamento Online',
                description:
                  'Reserve seu horário de forma rápida e descomplicada',
              },
              {
                icon: CheckCircle,
                title: 'Reserva Garantida',
                description: 'Sua vaga reservada com confirmação imediata',
              },
              {
                icon: '📱',
                title: 'Acompanhamento',
                description: 'Acompanhe sua reserva em tempo real',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex justify-center">
                    {typeof item.icon === 'string' ? (
                      <span className="text-3xl md:text-4xl">{item.icon}</span>
                    ) : (
                      <item.icon className="h-8 w-8 md:h-12 md:w-12 text-blue-600" />
                    )}
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

      {/* Seção "Como isso funciona" */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-5xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Como Funciona a Reserva
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  step: '1',
                  title: 'Escolha seu veículo',
                  description: 'Selecione o seu veículo cadastrado no sistema',
                },
                {
                  step: '2',
                  title: 'Selecione o Horário',
                  description:
                    'Escolha data e horário disponíveis para sua operação',
                },
                {
                  step: '3',
                  title: 'Escolha a Área',
                  description:
                    'Selecione a zona de carga e descarga mais conveniente',
                },
                {
                  step: '4',
                  title: 'Confirme a Reserva',
                  description: 'Receba a confirmação',
                },
              ].map((item, index) => (
                <div key={index} className="text-center p-3 md:p-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-sm md:text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-sm md:text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção do CTA */}
      <section className="bg-blue-600 text-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-5xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
              Pronto para fazer sua reserva?
            </h2>
            <p className="text-blue-100 text-sm md:text-base mb-6 md:mb-8 max-w-2xl mx-auto">
              Acesse o sistema e garanta sua área de carga e descarga de forma
              rápida e segura
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/autorizacao/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-sm md:text-base"
                >
                  Acessar Minha Conta
                </Button>
              </Link>
              <Link href="/autorizacao/cadastro">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 text-sm md:text-base"
                >
                  Criar Nova Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
