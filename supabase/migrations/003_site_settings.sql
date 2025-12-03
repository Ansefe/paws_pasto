-- =============================================
-- Tabla: site_settings
-- Descripción: Almacena la configuración del sitio
-- =============================================

-- Crear tabla site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice único en key para upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer la configuración
CREATE POLICY "Anyone can read site settings"
    ON public.site_settings
    FOR SELECT
    USING (true);

-- Política: Solo admins pueden modificar la configuración
CREATE POLICY "Only admins can insert site settings"
    ON public.site_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update site settings"
    ON public.site_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete site settings"
    ON public.site_settings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trigger_update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- Insertar configuración por defecto
INSERT INTO public.site_settings (key, value) VALUES
    ('siteName', '"Paws Pasto Adopciones"'),
    ('siteDescription', '"Plataforma de adopción de mascotas en Pasto, Nariño"'),
    ('siteUrl', '"https://paws.com"'),
    ('email', '"info@paws.com"'),
    ('phone', '"300 123 4567"'),
    ('whatsapp', '"573001234567"'),
    ('address', '"Pasto, Nariño, Colombia"'),
    ('instagram', '"https://instagram.com/pawspasto"'),
    ('facebook', '"https://facebook.com/pawspasto"'),
    ('tiktok', '""'),
    ('youtube', '""'),
    ('termsAndConditions', '"# Términos y Condiciones\n\n## 1. Aceptación\nAl usar Paws aceptas estos términos."'),
    ('privacyPolicy', '"# Política de Privacidad\n\n## 1. Información\nRecopilamos información básica."')
ON CONFLICT (key) DO NOTHING;

-- Comentarios
COMMENT ON TABLE public.site_settings IS 'Configuración del sitio web';
COMMENT ON COLUMN public.site_settings.key IS 'Clave única de la configuración';
COMMENT ON COLUMN public.site_settings.value IS 'Valor de la configuración en formato JSON';
