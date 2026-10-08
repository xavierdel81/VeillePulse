import { NewsAlert } from '../types/watch';
import { getAccessToken } from './firebaseAuth';

/**
 * Encodes a string to URL-safe Base64 as required by the Gmail API.
 */
function toBase64Url(str: string): string {
  // Handle UTF-8 encoding properly
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Builds an RFC 2822 formatted email string.
 */
function buildRfc2822Email(
  to: string,
  subject: string,
  htmlBody: string,
  from: string = 'me'
): string {
  const boundary = `----=_Part_${Date.now()}`;
  // Subject UTF-8 Base64 encoding
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    htmlBody,
  ];

  return lines.join('\r\n');
}

/**
 * Generates an executive, modern HTML template for a single news alert.
 */
export function generateAlertHtml(alert: NewsAlert, appUrl: string = ''): string {
  const impactColor =
    alert.impactScore >= 80 ? '#dc2626' : alert.impactScore >= 60 ? '#f59e0b' : '#3b82f6';
  const impactLabel =
    alert.impactScore >= 80
      ? 'Alerte Majeure'
      : alert.impactScore >= 60
      ? 'Impact Élevé'
      : 'Information Notée';

  const takeawaysHtml = alert.keyTakeaways
    .map(
      (item) => `
        <li style="margin-bottom: 8px; color: #334155; line-height: 1.5;">
          <strong style="color: #0f172a;">&bull;</strong> ${item}
        </li>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Alerte Veille : ${alert.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #38bdf8;">
          📡 VeillePulse &bull; Alerte Temps Réel
        </span>
        <span style="background-color: ${impactColor}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
          ${alert.impactScore}/100 - ${impactLabel}
        </span>
      </div>
      <h2 style="margin: 14px 0 0 0; font-size: 14px; font-weight: 500; color: #94a3b8;">
        Sujet suivi : <span style="color: #ffffff; font-weight: 600;">${alert.topicTitle}</span>
      </h2>
    </div>

    <!-- Body -->
    <div style="padding: 28px;">
      <h1 style="margin: 0 0 16px 0; font-size: 20px; line-height: 1.4; color: #0f172a; font-weight: 700;">
        ${alert.title}
      </h1>

      <!-- Meta Bar -->
      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
        <span style="background-color: ${alert.sourceType === 'reseaux_sociaux' ? '#f3e8ff' : '#e0f2fe'}; color: ${alert.sourceType === 'reseaux_sociaux' ? '#7e22ce' : '#0369a1'}; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
          ${alert.sourceType === 'reseaux_sociaux' ? '📱 Réseau Social' : '📰 Article de Presse'}
        </span>
        <span><strong>Source :</strong> ${alert.source}</span>
        <span>&bull;</span>
        <span><strong>Détecté le :</strong> ${new Date(alert.detectedAt).toLocaleString('fr-FR')}</span>
      </div>

      ${
        alert.directQuote
          ? `
      <!-- Direct Quote -->
      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px; font-style: italic; color: #0369a1; font-size: 13px; line-height: 1.5;">
        <strong style="font-style: normal; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; margin-bottom: 4px;">
          Extrait direct / Déclaration vérifiée :
        </strong>
        ${alert.directQuote}
      </div>`
          : ''
      }

      <!-- Summary -->
      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #0369a1;">
          Synthèse Exécutive
        </h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
          ${alert.summary}
        </p>
      </div>

      <!-- Key Takeaways -->
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">
          Points Clés à Retenir
        </h3>
        <ul style="margin: 0; padding-left: 18px;">
          ${takeawaysHtml}
        </ul>
      </div>

      ${
        alert.suggestedAction
          ? `
      <!-- Recommended Action -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px 18px; border-radius: 8px; margin-bottom: 26px;">
        <strong style="color: #065f46; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px;">
          💡 Recommandation Stratégique
        </strong>
        <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
          ${alert.suggestedAction}
        </p>
      </div>`
          : ''
      }

      <!-- Actions -->
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
        ${
          alert.sourceUrl
            ? `
        <a href="${alert.sourceUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600;">
          Consulter l'article direct &rarr;
        </a>`
            : ''
        }
        <a href="https://www.google.com/search?q=${encodeURIComponent('"' + alert.title.replace(/[:"«»]/g, ' ').trim().slice(0, 70) + '" ' + (alert.source || ''))}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600;">
          Recherche ciblée Google &rarr;
        </a>
        ${
          appUrl
            ? `
        <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #334155; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600;">
          Ouvrir le tableau de bord
        </a>`
            : ''
        }
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
      Notification générée automatiquement par votre moteur de veille <strong>VeillePulse</strong>.<br/>
      Pour ajuster les critères d'alerte ou la fréquence, rendez-vous dans les paramètres de veille.
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Generates an executive digest HTML email for multiple alerts.
 */
export function generateDigestHtml(
  alerts: NewsAlert[],
  recipientName: string = 'Veilleur',
  appUrl: string = ''
): string {
  const alertsHtml = alerts
    .map(
      (a) => `
    <div style="border-bottom: 1px solid #e2e8f0; padding: 16px 0;">
      <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase;">
        ${a.topicTitle} &bull; Impact ${a.impactScore}/100
      </div>
      <h3 style="margin: 6px 0; font-size: 15px; color: #0f172a;">
        <a href="${a.sourceUrl || '#'}" target="_blank" style="color: #0f172a; text-decoration: none;">
          ${a.title}
        </a>
      </h3>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; line-height: 1.5;">
        ${a.summary}
      </p>
      <div style="font-size: 11px; color: #94a3b8;">
        Source : ${a.source} &bull; ${new Date(a.detectedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}
      </div>
    </div>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Briefing Veille Exécutif</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background-color: #0f172a; padding: 24px; color: #ffffff;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #38bdf8;">
        📡 VeillePulse &bull; Synthèse Périodique
      </span>
      <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700;">
        Briefing de Veille & Signaux Stratégiques
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
        ${alerts.length} signaux majeurs détectés sur vos sujets suivis
      </p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #334155; margin-top: 0;">
        Bonjour ${recipientName}, voici le récapitulatif des actualités et alertes les plus marquantes détectées en temps réel par votre système de veille.
      </p>
      ${alertsHtml}
      ${
        appUrl
          ? `
      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">
          Accéder à la plateforme de veille en direct
        </a>
      </div>`
          : ''
      }
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends an email using the Gmail REST API (users.messages.send) with the authorized OAuth token.
 */
export async function sendGmailAlert(
  recipientEmail: string,
  alert: NewsAlert,
  appUrl: string = ''
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error(
        "Session Gmail non connectée. Veuillez cliquer sur 'Se connecter avec Google' pour autoriser l'envoi d'e-mails."
      );
    }

    const subject = `🚨 [Veille] ${alert.topicTitle} : ${alert.title.slice(0, 70)}...`;
    const htmlBody = generateAlertHtml(alert, appUrl);
    const rfc2822 = buildRfc2822Email(recipientEmail, subject, htmlBody);
    const raw = toBase64Url(rfc2822);

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error?.message || `Erreur API Gmail (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'e-mail Gmail:", error);
    return {
      success: false,
      error: error.message || "Erreur inconnue lors de l'envoi par Gmail",
    };
  }
}

/**
 * Sends a batch digest email using Gmail REST API.
 */
export async function sendGmailDigest(
  recipientEmail: string,
  alerts: NewsAlert[],
  recipientName: string = 'Veilleur',
  appUrl: string = ''
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error(
        "Session Gmail non connectée. Veuillez vous authentifier pour autoriser l'envoi d'e-mails."
      );
    }

    const subject = `📊 [Briefing Veille] ${alerts.length} actualités clés sur vos sujets suivis`;
    const htmlBody = generateDigestHtml(alerts, recipientName, appUrl);
    const rfc2822 = buildRfc2822Email(recipientEmail, subject, htmlBody);
    const raw = toBase64Url(rfc2822);

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error?.message || `Erreur API Gmail (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la génération du digest',
    };
  }
}
