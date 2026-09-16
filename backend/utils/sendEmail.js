import nodemailer from 'nodemailer'

let transporter = null

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function brandButton({ href, label, bg = '#2563eb' }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="border-radius:12px; background-color:${bg};">
          <a href="${escapeHtml(href)}" style="display:inline-block; padding:13px 28px; font-family:Inter, Arial, sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `
}

export function brandLayout({ accent = '#2563eb', title, content, footerText }) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding-bottom:20px;">
                <div style="font-family:Inter, Arial, sans-serif; font-size:20px; font-weight:800; color:#0f172a; letter-spacing:-0.5px; line-height:1;">
                  <span style="display:inline-block; background-color:${accent}; color:#ffffff; font-size:14px; font-weight:800; border-radius:8px; padding:6px 10px; margin-right:8px; vertical-align:middle;">E</span>
                  Easy<span style="color:${accent};">Job</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:32px; box-shadow:0 6px 24px rgba(2,6,23,0.06); font-family:Inter, Arial, sans-serif;">
                  <h1 style="margin:0 0 10px 0; font-size:20px; font-weight:700; color:#0f172a; line-height:1.3;">${escapeHtml(title)}</h1>
                  <div style="width:48px; height:4px; border-radius:2px; background-color:${accent}; margin-bottom:22px;"></div>
                  ${content}
                </div>
                <div style="padding:24px 8px 8px 8px; text-align:center; font-family:Inter, Arial, sans-serif; font-size:12px; color:#94a3b8; line-height:1.7;">
                  ${footerText || 'EasyJob — Votre carrière au Maroc'}<br />
                  © ${new Date().getFullYear()} EasyJob. Tous droits réservés.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function isEmailConfigured() {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS
    && !process.env.EMAIL_USER.startsWith('your_')
    && !process.env.EMAIL_PASS.startsWith('your_'))
}

function getFromAddress() {
  const envFrom = process.env.EMAIL_FROM
  if (envFrom && !envFrom.includes('your_email@gmail.com')) {
    return envFrom
  }
  return `EasyJob <${process.env.EMAIL_USER}>`
}

function getTransporter() {
  if (transporter) return transporter

  const port = parseInt(process.env.EMAIL_PORT || '587', 10)

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  })

  transporter.verify().then((ok) => {
    if (ok) console.log('✅ SMTP connecté et authentifié')
  }).catch((err) => {
    console.error('❌ Échec de la connexion SMTP:', err.message)
  })

  return transporter
}

export const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    if (!isEmailConfigured()) {
      console.warn(`⚠️ Email non envoyé à ${to} (sujet: "${subject}") — SMTP non configuré. Définissez EMAIL_USER/EMAIL_PASS dans le fichier .env`)
      return { success: false, emailSent: false, error: 'SMTP non configuré' }
    }

    const info = await getTransporter().sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      ...(attachments && attachments.length ? { attachments } : {}),
    })
    console.log('📧 Email envoyé:', info.messageId)
    return { success: true, emailSent: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message)
    return { success: false, emailSent: false, error: error.message }
  }
}

export const sendVerificationEmail = async (email, firstName, code) => {
  const content = `
    <p style="margin:0 0 8px 0; font-size:14px; color:#334155; line-height:1.6;">Bonjour <strong>${escapeHtml(firstName)}</strong>,</p>
    <p style="margin:0 0 22px 0; font-size:14px; color:#334155; line-height:1.6;">Merci de vous être inscrit sur EasyJob. Pour activer votre compte, saisissez le code de vérification suivant :</p>
    <div style="background:#eff6ff; border:2px dashed #2563eb; border-radius:12px; padding:18px; text-align:center; margin:0 0 22px 0;">
      <div style="font-family:Inter, Arial, sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:6px;">Code de vérification</div>
      <span style="font-family:Inter, Arial, sans-serif; font-size:32px; font-weight:800; color:#2563eb; letter-spacing:8px;">${escapeHtml(code)}</span>
    </div>
    <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">Ce code expire dans 10 minutes. Si vous n'avez pas créé de compte, ignorez cet email.</p>
  `
  return sendEmail({
    to: email,
    subject: 'EasyJob — Vérification de votre email',
    html: brandLayout({ title: 'Vérifiez votre adresse email', content }),
  })
}

export const sendPasswordResetEmail = async (email, firstName, resetUrl) => {
  const content = `
    <p style="margin:0 0 8px 0; font-size:14px; color:#334155; line-height:1.6;">Bonjour <strong>${escapeHtml(firstName)}</strong>,</p>
    <p style="margin:0 0 22px 0; font-size:14px; color:#334155; line-height:1.6;">Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en définir un nouveau :</p>
    ${brandButton({ href: resetUrl, label: 'Réinitialiser mon mot de passe' })}
    <p style="margin:0 0 6px 0; font-size:13px; color:#94a3b8; line-height:1.6;">Ce lien est valable pendant 1 heure.</p>
    <p style="margin:0 0 16px 0; font-size:13px; color:#94a3b8; line-height:1.6;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Votre mot de passe ne sera pas modifié.</p>
    <p style="margin:16px 0 0 0; font-size:12px; color:#94a3b8; line-height:1.6; word-break:break-all;">Le bouton ne fonctionne pas ? Copiez ce lien : <a href="${escapeHtml(resetUrl)}" style="color:#2563eb;">${escapeHtml(resetUrl)}</a></p>
  `
  return sendEmail({
    to: email,
    subject: 'EasyJob — Réinitialisation de votre mot de passe',
    html: brandLayout({ title: 'Réinitialisation du mot de passe', content }),
  })
}