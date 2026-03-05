interface FeedbackSenhaProps {
  regras: { mensagem: string; valido: boolean }[];
  forca: { texto: string; nivel: number } | null;
  senha: string;
}

export default function FeedbackSenha({
  regras,
  forca,
  senha,
}: FeedbackSenhaProps) {
  if (senha.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {forca && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Força da senha</span>
            <span
              className={
                forca.nivel === 1
                  ? 'text-red-500'
                  : forca.nivel === 2
                    ? 'text-amber-500'
                    : 'text-emerald-500'
              }
            >
              {forca.texto}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500
              ${
                forca.nivel === 1
                  ? 'w-1/3 bg-red-500'
                  : forca.nivel === 2
                    ? 'w-2/3 bg-amber-400'
                    : 'w-full bg-emerald-500'
              }`}
            />
          </div>
        </div>
      )}
      <ul className="space-y-1">
        {regras.map((regra, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span
              className={regra.valido ? 'text-emerald-500' : 'text-gray-400'}
            >
              {regra.valido ? '✓' : '○'}
            </span>
            <span className={regra.valido ? 'text-gray-600' : 'text-gray-400'}>
              {regra.mensagem}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
