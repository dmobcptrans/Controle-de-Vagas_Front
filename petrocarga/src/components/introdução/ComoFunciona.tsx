'use client';

import { AnimatedBeam } from '../ui/animated-beam';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    const update = () => setMatches(media.matches);

    update();

    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export default function ComoFunciona() {
  const containerRef = useRef<HTMLDivElement>(null);

  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);

  const refs = [ref1, ref2, ref3, ref4];

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const steps = [
    {
      step: '1',
      title: 'Escolha seu veículo',
      description: 'Selecione o seu veículo cadastrado no sistema',
    },
    {
      step: '2',
      title: 'Selecione o Horário',
      description: 'Escolha data e horário disponíveis para sua operação',
    },
    {
      step: '3',
      title: 'Escolha a Área',
      description: 'Selecione a zona de carga e descarga mais conveniente',
    },
    {
      step: '4',
      title: 'Confirme a Reserva',
      description: 'Receba a confirmação da sua operação',
    },
  ];

  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Título */}
          <motion.h2
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            className="
              text-xl
              md:text-3xl
              font-bold
              text-center
              mb-12
            "
          >
            Como Funciona a Reserva
          </motion.h2>


          <div
            ref={containerRef}
            className="
              relative
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-4
              gap-6
              md:gap-8
            "
          >

            {steps.map((item, index) => (
              <div
                key={index}
                className="
                  relative
                  z-10
                  flex
                  items-start
                  md:flex-col
                  md:items-center
                  text-left
                  md:text-center
                "
              >

                {/* Linha vertical mobile */}
                {index !== steps.length - 1 && (
                  <div
                    className="
                      absolute
                      left-6
                      top-14
                      h-[calc(100%+1.5rem)]
                      w-px
                      bg-blue-200
                      md:hidden
                    "
                  />
                )}


                {/* Bolinha fixa - NÃO ANIMAR */}
                <div
                  ref={refs[index]}
                  className="
                    shrink-0
                    flex
                    items-center
                    justify-center
                    w-12
                    h-12
                    rounded-full
                    bg-blue-600
                    text-white
                    font-bold
                    shadow-lg
                    relative
                    z-20
                    mr-5
                    md:mr-0
                    md:mb-4
                  "
                >
                  {item.step}
                </div>


                {/* Apenas o conteúdo entra animado */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                    ease: 'easeOut',
                  }}
                  className="
                    bg-white
                    rounded-xl
                    border
                    border-gray-100
                    shadow-sm
                    p-4
                    flex-1
                    md:p-0
                    md:border-0
                    md:shadow-none
                  "
                >

                  <h3
                    className="
                      font-semibold
                      text-lg
                      mb-1
                    "
                  >
                    {item.title}
                  </h3>


                  <p
                    className="
                      text-sm
                      text-gray-600
                      leading-relaxed
                    "
                  >
                    {item.description}
                  </p>

                </motion.div>

              </div>
            ))}


            {/* Beam somente desktop */}
            {isDesktop && (
              <>
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={ref1}
                  toRef={ref2}
                  curvature={0}
                  gradientStartColor="#2563eb"
                  gradientStopColor="#60a5fa"
                />

                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={ref2}
                  toRef={ref3}
                  curvature={0}
                  gradientStartColor="#2563eb"
                  gradientStopColor="#60a5fa"
                />

                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={ref3}
                  toRef={ref4}
                  curvature={0}
                  gradientStartColor="#2563eb"
                  gradientStopColor="#60a5fa"
                />
              </>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}