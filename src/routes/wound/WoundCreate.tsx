import type React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, type SubmitHandler } from "react-hook-form"

import woundRegion from '@/localdata/wound-location.json'
import woundTypes from '@/localdata/wound-type.json'

// Type definitions
type WoundRegionKey = string & { length: 2 };
type WoundLocationKey = string & { length: 2 };
type WoundTypeKey = string & { length: 2 };

interface WoundRegion {
  [key: WoundRegionKey]: {
    description: string;
    subregions: {
      [key: WoundLocationKey]: string;
    };
  };
}

interface WoundType {
  [key: WoundTypeKey]: string;
}

interface FormData {
  wound_region: WoundRegionKey;
  wound_location: WoundLocationKey;
  wound_type: WoundTypeKey;
  start_date: string; // Using string for date as it comes from input field
}

interface WoundCreateProps {
  woundRegion: WoundRegion;
  woundTypes: WoundType[];
}

const WoundCreate: React.FC<WoundCreateProps> = () => {
  const [selectedRegion, setSelectedRegion] = useState<WoundRegionKey | "">("");
  const { register, handleSubmit, setValue, watch } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
    // Here you would typically send the data to your backend
  };

  const handleRegionChange = (value: WoundRegionKey) => {
    setSelectedRegion(value);
    setValue('wound_region', value);
    setValue('wound_location', '' as WoundLocationKey); // Reset location when region changes
  };

  const watchRegion = watch('wound_region');

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md rounded-b-none">
        <CardHeader>
          <CardTitle>Adicionar nova ferida</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wound_region">Região da ferida</Label>
              <Select onValueChange={handleRegionChange}>
                <SelectTrigger id="wound_region">
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(woundRegion).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('wound_region')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wound_location">Localização da ferida</Label>
              <Select 
                onValueChange={(value) => setValue('wound_location', value as WoundLocationKey)} 
                disabled={!selectedRegion}
              >
                <SelectTrigger id="wound_location">
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  {watchRegion && Object.entries(woundRegion[watchRegion as WoundRegionKey].subregions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('wound_location')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wound_type">Tipo da ferida</Label>
              <Select onValueChange={(value) => setValue('wound_type', value as WoundTypeKey)}>
                <SelectTrigger id="wound_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(woundTypes).map(([key,label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('wound_type')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Data do começo</Label>
              <Input type="date" id="start_date" {...register('start_date')} />
            </div>

            <Button type="submit" className="w-full">Adicionar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WoundCreate;