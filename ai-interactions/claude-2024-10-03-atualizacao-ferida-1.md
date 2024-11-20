Giving the following plantuml/salt specification, can you transform it in a TypeScript form with shadcn/ui and Tailwind?

```
@startsalt
{
  title Atualização da ferida
  Temperatura* | Data*
  "20" | "dd/mm/aaaa"
  Altura* | Largura*
  "20" | "20"
  Nível da dor*
  ^0^
  Quantidade exsudato
  ^Selecione a quantidade^
  Tipo de exsudato
  ^Selecione o tipo^
  Tipo de tecido
  ^Selecione o tipo de tecido^
  [Adicionar mais informações]
  [Adicionar foto]
}
@endsalt
```

The field "Nível da dor*" is a slider varying from 0 to 10.

The types of the fields are:
* Temperatura - body temperature
* Data - date
* Altura - wound height
* Largura - wound width
* Nível da dor - 0 to 10
* Quantidade exsudato - char(2) - dropdown values imported from the exudate_amount.json
* Tipo de exsudato - char(2) - dropdown values imported from the exudate_type.json
* Tipo de tecido - char(2) - dropdown imported from the tissue_type.json

exudate_amount.json and exudate_type.json are key/value pairs

tissue_type.json has the following layout:

```
{
  "tc": {
    "type": "Tecido cicatrizado",
    "description": "A ferida está completamente coberta com epitélio (nova pele)."
  },
  "te": {
    "type": "Tecido de epitelização",
    "description": "Para as feridas superficiais, aparece como um novo tecido róseo ou brilhante (pele) que se desenvolve a partir das bordas ou como “ilhas” na superfície da lesão."
  }
}
```