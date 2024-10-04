import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import the frequency data
import smokeFrequency from '@/localdata/smoke-frequency.json';
import drinkFrequency from '@/localdata/drink-frequency.json';

const PatientCreate = () => {
  const [showOptional, setShowOptional] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome*</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="phone_number">Telefone</Label>
            <Input id="phone_number" name="phone_number" placeholder="(00) 00000-0000" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="birthday">Data de nascimento*</Label>
            <Input id="birthday" name="birthday" type="date" required />
          </div>
          <div>
            <Label htmlFor="hospital_id">Cadastro do hospital</Label>
            <Input id="hospital_id" name="hospital_id" placeholder="Número do cadastro" />
          </div>
          <Button type="button" onClick={() => setShowOptional(!showOptional)}>
            {showOptional ? 'Ocultar opcionais' : 'Adicionar opcionais'}
          </Button>
        </CardContent>
      </Card>

      {showOptional && (
        <Card>
          <CardHeader>
            <CardTitle>Informações adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="height">Altura</Label>
                <Input id="height" name="height" type="number" />
              </div>
              <div className="flex-1">
                <Label htmlFor="weight">Peso</Label>
                <Input id="weight" name="weight" type="number" />
              </div>
            </div>
            <div>
              <Label>Comorbidades</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Diabete tipo 1', 'Hipertensão', 'Diabete tipo 2', 'Obesidade', 'Hiperlipoproteinemia', 'AVC'].map((comorbidity) => (
                  <div key={comorbidity} className="flex items-center space-x-2">
                    <Checkbox id={comorbidity} />
                    <Label htmlFor={comorbidity}>{comorbidity}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="other_comorbidities">Outras comorbidades</Label>
              <Textarea id="other_comorbidities" name="other_comorbidities" placeholder="Relacionar outras comorbidades" />
            </div>
            <div>
              <Label htmlFor="smoker">Fumante</Label>
              <Select name="smoker">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência de fumo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(smokeFrequency).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="drink_frequency">Bebida alcoólica</Label>
              <Select name="drink_frequency">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(drinkFrequency).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit">Cadastrar</Button>
    </form>
  );
};

export default PatientCreate;