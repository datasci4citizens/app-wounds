Giving the following plantuml/salt specification with two screens.

First screen:
```
@startsalt
{
  title Cadastro de paciente
  Nome*
  "Nome"
  Telefone
  "(00) 00000-0000"
  Email
  "Email"
  Data de nascimento*
  "dd/mm/aaaa"
  Cadastro do hospital
  "Número do cadastro"
  [Adicionar opcionais]
  [Cadastrar]
}
@endsalt
```

Second screen:
```
@startsalt
{
  title Cadastro de paciente
  Altura | Peso
  "20" | "20"
  Comorbidades
  ( ) Diabete tipo 1 | ( ) Hipertensão
  ( ) Diabete tipo 2 | ( ) Obesidade
  ( ) Hiperlipoproteinemia | ( ) AVC
  Outras comorbidades
  {+
    Relacionar outras comorbidades
    .
    .
    .
  }
  Fumante
  ^Selecione a frequência de fumo^
  Bebida alcoólica
  ^Selecione a frequência^
  [Cadastrar]
}
@endsalt
```

The second screen is extra optional data, accessed when the user clicks [Adicionar opcionais].

Can you transform it in a TypeScript form with shadcn/ui and Tailwind?

The fields are aligned with a database:

| Field | Database Field Name | Type |
| --- | --- | --- |
| Nome | name | string |
| Telefone | phone_number | string |
| Email | email | string |
| Data de nascimento | birthday | date |
| Cadastro do hospital | hospital_id | string |
| Altura | height | integer |
| Peso | weight | integer |
| Comorbidades | comorbidities | text |
| Fumante | smoker | char - dropdown values imported from the smoke-frequency.json |
| Bebida alcoólica | drink_frequency | char - dropdown values imported from the drink-frequency.json |

smoke-frequency.json and drink-frequency.json are key/value pairs