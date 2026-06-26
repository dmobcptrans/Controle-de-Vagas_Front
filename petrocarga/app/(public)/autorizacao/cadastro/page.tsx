'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, UserIcon } from 'lucide-react';

export default function CadastroPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">
            Escolha o tipo de cadastro
          </h1>

          <p className="text-muted-foreground mt-2">
            Selecione como deseja utilizar a plataforma.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Cadastro de Motorista */}
          <Link href="/autorizacao/cadastro/motorista">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-500">
              <CardHeader className="items-center">
                <UserIcon className="w-12 h-12 text-blue-600" />

                <CardTitle>Motorista</CardTitle>

                <CardDescription>
                  Cadastro destinado a usuários que irão realizar transportes.
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center text-sm text-muted-foreground">
                Informe seus dados pessoais, CNH e dados de acesso.
              </CardContent>
            </Card>
          </Link>

          {/* Cadastro de Empresa */}
          <Link href="/autorizacao/cadastro/empresa">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-500">
              <CardHeader className="items-center">
                <Building2 className="w-12 h-12 text-blue-600" />

                <CardTitle>Empresa</CardTitle>

                <CardDescription>
                  Cadastro destinado às empresas responsáveis pelas cargas.
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center text-sm text-muted-foreground">
                Informe os dados da empresa e do responsável.
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>
    </main>
  );
}