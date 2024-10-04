

## Model Issues
* `patient_id` - UUID
* `name` - limit?
* `email`?
* `phone_number` - limit?
* `birthday`- only date?
* `hospital_id`?

CREATE TABLE patients
(
    patient_id integer NOT NULL DEFAULT nextval('patients_patient_id_seq'::regclass),
    name character varying,
    phone_number character varying,
    birthday timestamp,

    is_smoker boolean NOT NULL,
    drink_frequency character varying,
    observations character varying,
    accept_tcle boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT patients_pkey PRIMARY KEY (patient_id)
)

`drink-frequency.json`?