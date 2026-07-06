import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="bg-blue-800 w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground text-white">
              CPTrans Petrópolis
            </h3>
            <p className="text-muted-foreground text-sm text-white">
              Sistema de Reserva de Vagas de Carga e Descarga
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground text-white">
              Contato
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-white">
                <Phone className="h-4 w-4" />
                <span>(24) 2246-9300</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Mail className="h-4 w-4" />
                <span>contato@cptrans.petropolis.rj.gov.br</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" />
                <span>Petrópolis - RJ</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground text-white">
              Horário de Atendimento
            </h3>
            <p className="text-sm text-muted-foreground text-white">
              Segunda a Sexta: 8h às 17h
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground text-white">
          <p>
            &copy; {new Date().getFullYear()} CPTrans Petrópolis. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
