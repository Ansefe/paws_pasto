/**
 * Servicio de notificaciones por Telegram
 * 
 * Para configurar:
 * 1. Crea un bot en Telegram con @BotFather (envía /newbot)
 * 2. Guarda el token que te da
 * 3. Crea un grupo y añade el bot como administrador
 * 4. Obtén el chat_id del grupo visitando:
 *    https://api.telegram.org/bot<TU_TOKEN>/getUpdates
 *    (después de enviar un mensaje al grupo)
 * 5. Agrega las variables a tu .env:
 *    VITE_TELEGRAM_BOT_TOKEN=tu_token
 *    VITE_TELEGRAM_CHAT_ID=tu_chat_id
 */

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

export interface ApplicationData {
  type: 'foundation' | 'rescuer'
  organizationName: string
  contactName: string
  email: string
  phone: string
  city: string
  address?: string
  description: string
  instagram?: string
  facebook?: string
  website?: string
  experience: string
  motivation: string
  references?: string
}

/**
 * Envía un mensaje de notificación a Telegram cuando llega una postulación
 */
export async function sendTelegramNotification(data: ApplicationData): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram no configurado. Revisa las variables VITE_TELEGRAM_BOT_TOKEN y VITE_TELEGRAM_CHAT_ID')
    return false
  }

  const typeLabel = data.type === 'foundation' ? '🏠 Fundación' : '🦸 Rescatista'
  
  const message = `
📬 *NUEVA POSTULACIÓN*

${typeLabel}
━━━━━━━━━━━━━━━━━━━━

🏷 *${data.organizationName}*

👤 *Contacto:* ${data.contactName}
📧 *Email:* ${data.email}
📱 *Teléfono:* ${data.phone}
📍 *Ciudad:* ${data.city}
${data.address ? `🏠 *Dirección:* ${data.address}` : ''}

📝 *Descripción:*
${data.description}

💼 *Experiencia:*
${data.experience}

💬 *Motivación:*
${data.motivation}

${data.instagram ? `📸 Instagram: ${data.instagram}` : ''}
${data.facebook ? `📘 Facebook: ${data.facebook}` : ''}
${data.website ? `🌐 Web: ${data.website}` : ''}

${data.references ? `📋 *Referencias:*\n${data.references}` : ''}

━━━━━━━━━━━━━━━━━━━━
⏰ ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
`.trim()

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    const result = await response.json()
    
    if (!result.ok) {
      console.error('Error de Telegram:', result.description)
      return false
    }

    return true
  } catch (error) {
    console.error('Error enviando mensaje a Telegram:', error)
    return false
  }
}

/**
 * Envía un mensaje genérico a Telegram
 */
export async function sendTelegramMessage(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram no configurado')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    const result = await response.json()
    return result.ok
  } catch (error) {
    console.error('Error enviando mensaje a Telegram:', error)
    return false
  }
}
