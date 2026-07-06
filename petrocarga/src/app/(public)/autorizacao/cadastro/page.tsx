'use client';

import Link from 'next/link';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Building2, UserIcon } from 'lucide-react';

export default function CadastroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-5xl mx-auto mb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">
            Escolha o tipo de cadastro
          </h1>
        </div>

       <div className="animate-in slide-in-from-bottom-6 fade-in duration-500 grid grid-cols-1 gap-6 md:grid-cols-2">
  {/* Cadastro de Motorista */}
  <Link href="/autorizacao/cadastro/motorista">
    <Card className="group h-full cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg">
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
    <Card className="group h-full cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg">
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
