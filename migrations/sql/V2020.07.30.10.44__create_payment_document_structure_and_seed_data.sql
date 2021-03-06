CREATE TABLE IF NOT EXISTS payment_document_type (
	payment_document_code varchar PRIMARY KEY,
	description varchar NOT NULL,
	active bool NOT NULL DEFAULT true,
	create_user varchar NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	long_description varchar
);

ALTER TABLE payment_document_type OWNER TO dsrp;

INSERT INTO payment_document_type (
    payment_document_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('FIRST_PRF', 'Payment Request Form (First Phase)', 'system', 'system'),
    ('INTERIM_PRF', 'Payment Request Form (Interim Phase)', 'system', 'system'),
    ('FINAL_PRF', 'Payment Request Form (Final Phase)', 'system', 'system')
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS payment_document (
	document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	application_guid uuid NOT NULL,
	payment_document_code varchar NOT NULL,
	invoice_number varchar NOT NULL UNIQUE,
	content jsonb NOT NULL,
	work_ids varchar ARRAY,
	document_name varchar NOT NULL,
	object_store_path varchar NOT NULL UNIQUE,
	upload_date timestamptz NOT NULL,
	active_ind bool NOT NULL DEFAULT true,
	create_user varchar(60) NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar(60) NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (application_guid) REFERENCES application(guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (payment_document_code) REFERENCES payment_document_type(payment_document_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE payment_document OWNER TO dsrp;

ALTER TABLE application_document DROP COLUMN IF EXISTS document_manager_guid;
