'use client';

import { motion } from 'framer-motion';
import { Building, Target, Eye, Heart, Calendar, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export default function QuemSomos() {
  const pilares = [
    {
      icon: Target,
      title: 'Missão',
      description:
        'Otimizar a gestão do transporte municipal através de soluções inovadoras, garantindo eficiência e segurança nas operações.',
    },
    {
      icon: Eye,
      title: 'Visão',
      description:
        'Ser referência em gestão de mobilidade urbana, promovendo tecnologia, organização e desenvolvimento sustentável.',
    },
    {
      icon: Heart,
      title: 'Valores',
      description:
        'Transparência, inovação, eficiência, compromisso com o cidadão e responsabilidade social.',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
            Institucional
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Quem <span className="text-blue-600">Somos</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
            Conheça a CPTrans - Companhia Petropolitana de Trânsito e
            Transporte.
          </p>
        </motion.section>

        {/* SOBRE */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="p-6 md:p-10">
              <div className="flex gap-4 md:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                    Sobre a CPTrans
                  </h2>

                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 md:text-base">
                    <p>
                      A CPTrans é uma empresa pública municipal dedicada ao
                      planejamento, gestão e fiscalização do sistema de
                      transporte da cidade.
                    </p>

                    <p>
                      Atua desenvolvendo soluções modernas para melhorar a
                      mobilidade urbana, trazendo mais eficiência, segurança e
                      organização para os cidadãos e empresas.
                    </p>

                    <p>
                      Através da tecnologia, novos sistemas digitais são
                      implementados para facilitar processos como o
                      gerenciamento das operações de carga e descarga.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* PILARES */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">
            Nossos Pilares
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {pilares.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="
                    rounded-3xl
                    border-slate-200
                    transition-all
                    hover:-translate-y-1
                    hover:shadow-lg
                  "
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                      <Icon className="h-7 w-7 text-blue-600" />
                    </div>

                    <h3 className="mt-5 font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>

        {/* HISTÓRIA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 md:text-3xl">
            Nossa História
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: Calendar,
                title: 'Fundação e Evolução',
                text: 'Criada para modernizar a gestão do transporte municipal, a CPTrans evolui constantemente através da tecnologia.',
              },
              {
                icon: Users,
                title: 'Compromisso Social',
                text: 'Buscamos soluções que aproximem o poder público, empresas e cidadãos, melhorando a mobilidade urbana.',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="rounded-3xl border-slate-200">
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>

                      <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>

        {/* FINAL */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div
            className="
            rounded-3xl
            bg-blue-600
            px-6
            py-10
            text-center
            text-white
            shadow-lg
            md:px-12
          "
          >
            <h2 className="text-2xl font-bold md:text-3xl">
              Compromisso com a Inovação
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-blue-100 md:text-base">
              Investimos em tecnologia para criar soluções digitais que
              simplificam processos, aumentam a eficiência e melhoram a
              experiência dos usuários.
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
