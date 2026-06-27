"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Stethoscope, UserCircle } from "lucide-react";

export default function PatientInfoPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 pt-16 pb-8 bg-background">
      <title>Informações para Pacientes - Cicatrizando</title>

      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Para pacientes
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            O acesso ao aplicativo como <strong className="text-foreground">paciente</strong> é realizado
            por meio de um convite do seu especialista de saúde.
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div className="p-4 bg-white dark:bg-card border border-border rounded-2xl space-y-2">
            <p>
              <strong className="text-foreground">1.</strong> Solicite ao seu médico, enfermeiro ou
              profissional de saúde que acompanha suas feridas que cadastre você no aplicativo{" "}
              <strong className="text-primary">Cicatrizando</strong>.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-card border border-border rounded-2xl space-y-2">
            <p>
              <strong className="text-foreground">2.</strong> O profissional irá registrar seu e-mail
              e suas informações clínicas no sistema. Você receberá um convite por e-mail para acessar
              o aplicativo.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-card border border-border rounded-2xl space-y-2">
            <p>
              <strong className="text-foreground">3.</strong> Após receber o convite, faça login com
              sua conta Google utilizando o mesmo e-mail informado ao seu especialista.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-card border border-border rounded-2xl space-y-2">
            <p>
              <strong className="text-foreground">4.</strong> Complete seu cadastro com informações
              de saúde e comece a acompanhar a evolução das suas feridas pelo aplicativo.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Stethoscope className="w-4 h-4 text-primary" />
          <span>
            Você é um profissional de saúde?{" "}
            <button
              onClick={() => router.back()}
              className="text-primary font-bold underline"
            >
              Voltar e selecionar Especialista
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
