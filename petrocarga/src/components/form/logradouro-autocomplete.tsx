
'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { clientApi } from '@/services/clientApi';
import { Loader2, MapPin } from 'lucide-react';

interface Logradouro {
  id: string;
  logradouro: string;
  bairro: string;
}

interface LogradouroAutocompleteProps {
  initialValue?: string;
  onSelect?: (logradouro: Logradouro) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
}

export default function LogradouroAutocomplete({
  initialValue = '',
  onSelect,
  onChange,
  placeholder = 'Digite o nome da rua',
  name = 'logradouro',
  id = 'logradouro',
}: LogradouroAutocompleteProps) {
  const [valor, setValor] = useState(initialValue);
  const [sugestoes, setSugestoes] = useState<Logradouro[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mantém o valor atualizado caso o formulário receba outro logradouro.
  useEffect(() => {
    setValor(initialValue);
  }, [initialValue]);

  // Fecha o dropdown ao clicar fora do componente.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Busca logradouros com debounce.
  useEffect(() => {
    const termo = valor.trim();

    if (termo.length < 2) {
      setSugestoes([]);
      setCarregando(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setCarregando(true);

        const response = await clientApi(
          `/endereco-vaga/byLogradouro/${encodeURIComponent(termo)}`,
          {
            method: 'GET',
            signal: controller.signal,
          },
        );

        const dados: Logradouro[] = await response.json();

        setSugestoes(dados);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erro ao consultar logradouros:', error);
          setSugestoes([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [valor]);

  const handleChange = (novoValor: string) => {
    setValor(novoValor);
    setAberto(true);
    setIndiceSelecionado(-1);
    onChange?.(novoValor);
  };

  const selecionarLogradouro = (logradouro: Logradouro) => {
    setValor(logradouro.logradouro);
    setSugestoes([]);
    setAberto(false);
    setIndiceSelecionado(-1);

    onChange?.(logradouro.logradouro);
    onSelect?.(logradouro);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!aberto || sugestoes.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      setIndiceSelecionado((prev) =>
        prev < sugestoes.length - 1 ? prev + 1 : 0,
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      setIndiceSelecionado((prev) =>
        prev > 0 ? prev - 1 : sugestoes.length - 1,
      );
    }

    if (e.key === 'Enter' && indiceSelecionado >= 0) {
      e.preventDefault();
      selecionarLogradouro(sugestoes[indiceSelecionado]);
    }

    if (e.key === 'Escape') {
      setAberto(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          id={id}
          name={name}
          value={valor}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setAberto(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="rounded-sm border-gray-400 text-sm md:text-base pr-10"
          role="combobox"
          aria-expanded={aberto && sugestoes.length > 0}
          aria-autocomplete="list"
        />

        {carregando && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {aberto && valor.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
          {sugestoes.length > 0 ? (
            <ul
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
            >
              {sugestoes.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={indiceSelecionado === index}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selecionarLogradouro(item)}
                    className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors ${
                      indiceSelecionado === index
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {item.logradouro}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {item.bairro}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !carregando && (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                Nenhum logradouro encontrado. Você pode cadastrar um novo.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}