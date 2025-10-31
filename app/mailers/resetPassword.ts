import brevo from '@getbrevo/brevo'
import env from '#start/env'
export default class ResetPasswordMailer {
  private brevoClient: brevo.TransactionalEmailsApi

  constructor(
    private email: string,
    private firstname: string,
    private code: string
  ) {
    const client = new brevo.TransactionalEmailsApi()
    client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.get('BREVO_API_KEY'))
    this.brevoClient = client
  }

  public async sendNow() {
    try {
      await this.brevoClient.sendTransacEmail({
        to: [{ email: this.email }],
        templateId: 2, // 👈 ID du template Brevo
        params: {
          reset_code: this.code, // 👈 variable du template
          firstname: this.firstname, // tu peux en ajouter d’autres selon ton template
        },
      })
      console.log('Email envoyé à', this.email)
    } catch (error) {
      console.error('Erreur envoi email Brevo :', error)
    }
  }
}
