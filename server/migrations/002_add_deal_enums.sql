-- Create enum types for deals
DO $$ BEGIN
    CREATE TYPE deal_phase AS ENUM (
        'Erstkontakt',
        'Angebot',
        'Angebot versendet',
        'Ersttermin',
        'Verhandlung',
        'Abgeschlossen',
        'Verloren'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM (
        'Aktiv',
        'Pausiert',
        'Abgeschlossen',
        'Storniert',
        'Erfolgreich abgeschlossen - Einmalig',
        'In Kooperation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update deals table to use the new enum types
ALTER TABLE deals 
    ALTER COLUMN phase TYPE deal_phase USING phase::deal_phase,
    ALTER COLUMN status TYPE deal_status USING status::deal_status; 