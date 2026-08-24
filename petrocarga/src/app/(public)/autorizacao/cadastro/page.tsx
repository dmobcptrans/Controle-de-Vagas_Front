'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, UserIcon } from 'lucide-react';

export default function CadastroPage() {
  return (
    <main
      className="
    relative
    flex
    items-center
    justify-center
    min-h-[calc(100dvh-64px)]
    w-full
    overflow-hidden
    bg-blue-800
  "
    >
      <div
        className="
      absolute
      left-1/2
      bottom-0
      -translate-x-1/2
      pointer-events-none
      z-0
      bg-blue-900
    "
        style={{
          width: '150%',
          height: '50%',
          borderTopLeftRadius: '50%',
          borderTopRightRadius: '50%',
          boxShadow: '0 -20px 60px rgba(30,58,138,0.35)',
        }}
      />
      <div className="relative z-10 mb-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Escolha o tipo de cadastro
          </h1>
          <p className="mt-2 text-blue-100">
            Selecione uma das opções abaixo para continuar.
          </p>
        </div>

        <div className="animate-in slide-in-from-bottom-6 fade-in duration-500 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Cadastro de Motorista */}
          <Link href="/autorizacao/cadastro/motorista">
            <Card className="group h-full cursor-pointer border rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg">
              <CardContent className="flex items-center gap-5 p-6 md:p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Motorista</h3>
                  <p className="text-sm text-muted-foreground">
                    Cadastro de motorista
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Cadastro de Empresa */}
          <Link href="/autorizacao/cadastro/empresa">
            <Card className="group h-full cursor-pointer border transition-all rounded-3xl duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg">
              <CardContent className="flex items-center gap-5 p-6 md:p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    Cadastro de empresa
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
