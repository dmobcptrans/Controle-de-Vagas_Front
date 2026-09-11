'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { InstallPWAButton } from '@/components/pwa/InstallPWAButton';
import ComoFunciona from '@/components/introdução/ComoFunciona';

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
          router.replace('/reservar-vaga');
          break;
        case 'AGENTE':
          router.replace('/agente/reserva-rapida');
          break;
        case 'EMPRESA':
          router.replace('/reservar-vaga');
          break;
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const scrollToBeneficios = () => {
    document
      .getElementById('beneficios')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enquanto o /me está sendo carregado
  if (loading) return null;

  // Se já estiver logado, nem renderiza a Home (vai redirecionar)
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Seção da Hero */}
      <section className="relative w-full min-h-[calc(98dvh-4rem)] md:min-h-[calc(95vh-4rem)] bg-blue-800 flex flex-col overflow-hidden pt-12 pb-0 md:py-0">
        <div className="container mx-auto px-4 flex-1 flex">
          <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-2 md:gap-8 items-center w-full max-w-6xl mx-auto">
            <div className="text-center md:text-left flex flex-col justify-center items-center md:items-start relative z-20">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
              >
                Petrocarga,
                <br className="hidden lg:inline" />
                <span className="text-blue-300"> Carga e Descarga</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                className="text-base md:text-xl text-blue-100 mb-6 md:mb-8 max-w-lg"
              >
                Sistema oficial da CPTrans para reserva e gestão de áreas
                destinadas à carga e descarga no município.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              >
                <Link href="/autorizacao/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-gray-100 w-full sm:w-auto"
                  >
                    Fazer Reserva
                  </Button>
                </Link>

                <InstallPWAButton />
              </motion.div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 140,
                x: -25,
                rotate: -18,
                scale: 0.85,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                x: 0,
                rotate: 0,
                scale: 1,
              }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 1.1,
                type: 'spring',
                stiffness: 70,
                damping: 15,
              }}
              className="relative flex justify-center md:justify-end items-end self-stretch h-full -translate-y-8 md:-translate-y-4"
            >
              <Image
                src="/images/ilustracao-celular.webp"
                alt="Mockup do aplicativo"
                width={1440}
                height={2560}
                priority
                className="w-full max-w-[190px] sm:max-w-[240px] md:max-w-[300px] h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg
            className="relative block w-full h-[80px] md:h-[120px]"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#f8fafc"
              d="M0,70 C300,140 600,0 900,50 C1150,90 1300,100 1440,40 L1440,120 L0,120 Z"
            />
          </svg>
        </div>

        {/* Seta de scroll */}
        <motion.button
          onClick={scrollToBeneficios}
          aria-label="Ver mais"
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: 1,
            y: [0, 10, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.5 },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20
    flex items-center justify-center w-16 h-8
    rounded-full
    border border-slate-300/70
    bg-slate-100/80
    backdrop-blur-xl
    text-slate-600
    hover:bg-slate-200/90
    hover:border-slate-400
    hover:text-slate-800
    shadow-lg shadow-slate-900/10
    transition-all duration-300 cursor-pointer"
        >
          <ChevronDown className="h-5 w-5 stroke-[2.5]" />
        </motion.button>
      </section>

      {/* Seção de Benefícios  */}
      <section
        id="beneficios"
        className="
    relative
    w-full
    min-h-[calc(100dvh-4rem)]
    md:min-h-[calc(100vh-4rem)]
    flex
    flex-col
    overflow-hidden
    py-12
    md:py-20
  "
      >
        <div className="container mx-auto px-4 flex-1 flex flex-col">
          <div className="w-full max-w-6xl mx-auto flex-1 flex items-center">
      <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  image: '/images/calendar.webp',
                  title: 'Agendamento Online',
                  description:
                    'Reserve seu horário de forma rápida e descomplicada diretamente pelo sistema.',
                },
                {
                  image: '/images/check.webp',
                  title: 'Reserva Garantida',
                  description:
                    'Sua vaga reservada no local escolhido com confirmação digital imediata.',
                },
                {
                  image: '/images/phone.webp',
                  title: 'Acompanhamento',
                  description:
                    'Monitore o status e os horários da sua reserva em tempo real na palma da mão.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: 'easeOut',
                  }}
                >
                  <Card
                    className="
      group
      relative
      mt-16
      h-full
      overflow-visible
      rounded-[32px]
      border border-slate-200/60
      bg-gradient-to-b from-white via-white to-slate-50
      shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      transition-all
      duration-500
      hover:-translate-y-3
      hover:shadow-[0_30px_70px_rgba(15,23,42,0.14)]
    "
                  >
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

                    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-500/[0.03] via-transparent to-transparent pointer-events-none" />

                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={180}
                        height={180}
                        className="drop-shadow-[0_20px_35px_rgba(15,23,42,0.18)] select-none pointer-events-none"
                      />
                    </div>

                    <CardContent className="relative pt-28 px-7 pb-7 text-center">
                      <h3 className="text-xl font-bold tracking-tight text-slate-900">
                        {item.title}
                      </h3>

                      <div className="flex justify-center my-5">
                        <div className="h-1 w-10 rounded-full bg-blue-500/30" />
                      </div>

                      <p className="text-[15px] leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção "Como isso funciona" */}

      <ComoFunciona />

      {/* Seção do CTA */}
      <section className=" rounded-t-[5rem] bg-gradient-to-b from-blue-800 to-blue-950 text-white py-8 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-5xl mx-auto text-center"
          >
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
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-800 text-sm md:text-base"
                >
                  Criar Nova Conta
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
