'use client';
import { Button } from '@/components/ui/button';
import coneImg from '@/public/images/cone.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-5xl py-20 text-center">
      <h2 className="font-display text-4xl font-black">
        Nada encontrado aqui...
      </h2>
      <Image
        className="mx-auto w-sm"
        src={coneImg}
        alt="ilustração de um barco"
      />
      <p className="text-3xl font-extralight text-gray-400">
        Não foi possível encontrar a página solicitada.
      </p>

      {/* Container para centralizar o botão */}
      <div className="flex justify-center mt-10">
        <Button
          onClick={() => router.back()}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base px-6 md:px-8 py-3 md:py-4"
        >
          Retornar para a página anterior
        </Button>
      </div>
    </main>
  );
}
