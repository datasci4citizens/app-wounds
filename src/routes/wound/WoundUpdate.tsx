import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import exudateAmounts from '@/localdata/exudate-amount.json'
import exudateTypes from '@/localdata/exudate-type.json'
import tissueTypes from '@/localdata/tissue-type.json'

interface ExudateOption {
  [key: string]: string;
}

interface TissueTypeOption {
  [key: string]: {
    type: string;
    description: string;
  };
}

interface WoundUpdateProps {
  exudateAmounts: ExudateOption
  exudateTypes: ExudateOption
  tissueTypes: TissueTypeOption
}

const WoundUpdate: React.FC<WoundUpdateProps> = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Atualização da ferida</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperatura*</Label>
              <Input id="temperature" type="number" placeholder="20" required />
            </div>
            <div>
              <Label htmlFor="date">Data*</Label>
              <Input id="date" type="date" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Altura*</Label>
              <Input id="height" type="number" placeholder="20" required />
            </div>
            <div>
              <Label htmlFor="width">Largura*</Label>
              <Input id="width" type="number" placeholder="20" required />
            </div>
          </div>
          
          <div>
            <Label htmlFor="painLevel">Nível da dor*</Label>
            <Slider
              id="painLevel"
              min={0}
              max={10}
              step={1}
              defaultValue={[0]}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="exudateAmount">Quantidade exsudato</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a quantidade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(exudateAmounts).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="exudateType">Tipo de exsudato</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(exudateTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tissueType">Tipo de tecido</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de tecido" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tissueTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="button" variant="outline" className="w-full">
            Adicionar mais informações
          </Button>
          
          <Button type="button" variant="outline" className="w-full">
            Adicionar foto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WoundUpdate;