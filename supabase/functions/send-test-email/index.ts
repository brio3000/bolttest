import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SmtpConfig {
  host: string;
  port: number;
  security: 'none' | 'ssl_tls' | 'starttls';
  username: string;
  password: string;
}

interface TestEmailRequest {
  recipient: string;
  smtpConfig: SmtpConfig;
  senderEmail: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recipient, smtpConfig, senderEmail }: TestEmailRequest = await req.json();

    if (!recipient || !smtpConfig) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Paramètres manquants : recipient et smtpConfig sont requis.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Configuration SMTP incomplète. Veuillez vérifier tous les champs.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const secureConnection = smtpConfig.security === 'ssl_tls';
    const requireTLS = smtpConfig.security === 'starttls';

    const emailContent = {
      from: senderEmail || 'notifications@pkigest.com',
      to: recipient,
      subject: 'Test de configuration SMTP - PkiGest Pro',
      text: `Bonjour,\n\nCeci est un e-mail de test pour vérifier votre configuration SMTP.\n\nSi vous recevez ce message, cela signifie que votre configuration SMTP est correcte et fonctionnelle.\n\nParamètres utilisés :\n- Hôte : ${smtpConfig.host}\n- Port : ${smtpConfig.port}\n- Sécurité : ${smtpConfig.security}\n\nCordialement,\nL'équipe PkiGest Pro`,
      html: `<html><body><h2>Test de configuration SMTP</h2><p>Bonjour,</p><p>Ceci est un e-mail de test pour vérifier votre configuration SMTP.</p><p>Si vous recevez ce message, cela signifie que votre configuration SMTP est <strong>correcte et fonctionnelle</strong>.</p><h3>Paramètres utilisés :</h3><ul><li><strong>Hôte :</strong> ${smtpConfig.host}</li><li><strong>Port :</strong> ${smtpConfig.port}</li><li><strong>Sécurité :</strong> ${smtpConfig.security}</li></ul><p>Cordialement,<br/>L'équipe PkiGest Pro</p></body></html>`,
    };

    console.log(`Tentative d'envoi d'e-mail de test à ${recipient} via ${smtpConfig.host}:${smtpConfig.port}`);

    try {
      const smtpUrl = `smtp://${encodeURIComponent(smtpConfig.username)}:${encodeURIComponent(smtpConfig.password)}@${smtpConfig.host}:${smtpConfig.port}`;
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_url: smtpUrl,
          secure: secureConnection,
          require_tls: requireTLS,
          ...emailContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Échec de l'envoi : ${response.statusText}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `E-mail de test envoyé avec succès à ${recipient} !`,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (smtpError: any) {
      console.error('Erreur SMTP:', smtpError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Échec de l'envoi : ${smtpError.message || 'Erreur inconnue'}. Vérifiez vos paramètres SMTP.`,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error: any) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur : ${error.message || 'Erreur inconnue'}`,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});