Consider that I want to connect this screen in a second when the user clicks on the [Adicionar mais informações] button:

```
@startsalt
{
  title Atualização da ferida
  Quantidade de trocas de curativo no dia
  " "
  Pele ao redor da ferida
  ^Selecione o estado da pele^
  Bordas da ferida
  ^Selecione o estado das bordas^
  [ ] Teve febre nas últimas 48 horas
  [Adicionar foto]
}
@endsalt
```

The field "Teve febre nas últimas 48 horas" is a switch.

The types of the fields are:

* Quantidade de trocas de curativo no dia - integer
* Pele ao redor da ferida - char(2) - dropdown values imported from the skin-around.json
* Bordas da ferida - char(2) - dropdown values imported from the wound-edges.json
* Teve febre nas últimas 48 horas - boolean

The fields of the previous screen plus these fields will be sent to a database, with the following field names: `temperature`, `date`, `height`, `width`, `pain_level`, `exudate_amount`, `exudate_type`, `tissue_type`, `curative_changes`, `skin_around`, `wound_edges`, `fever`.

| Field | Database Field Name | Type |
| --- | --- | --- |
| Temperatura | temperature | decimal |
| Data | updated_at | date |
| Altura | height | integer |
| Largura | width | integer |



* Temperatura - body temperature
* Data - date
* Altura - wound height
* Largura - wound width
* Nível da dor - 0 to 10
* Quantidade exsudato - char(2) - dropdown values imported from the exudate_amount.json
* Tipo de exsudato - char(2) - dropdown values imported from the exudate_type.json
* Tipo de tecido - char(2) - dropdown imported from the tissue_type.json