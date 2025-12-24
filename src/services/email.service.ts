
import { Injectable } from '@angular/core';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly postmarkApiUrl = 'https://api.postmarkapp.com/email';
  
  // Postmark Server Token for testing purposes.
  // In a real application, this should be handled via secure environment variables.
  private readonly serverToken = '11f60fee-8769-4145-8ce9-a84c03766dc2'; 
  
  // This MUST be a sender signature registered and verified with your Postmark account.
  private readonly fromEmail = 'contact@majjane.ma';

  async sendEmail(payload: EmailPayload): Promise<void> {
    if (!this.serverToken) {
      const errorMessage = 'Postmark server token is not configured. Email was simulated in console.';
      console.error(errorMessage);
      console.log('--- EMAIL SIMULATION (NO TOKEN) ---');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Body:\n${payload.body}`);
      console.log('-----------------------------------');
      throw new Error(errorMessage);
    }

    try {
      const response = await fetch(this.postmarkApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.serverToken
        },
        body: JSON.stringify({
          From: this.fromEmail,
          To: payload.to,
          Subject: payload.subject,
          HtmlBody: payload.body.replace(/\n/g, '<br>') // Convert newlines to <br> for HTML email
        })
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Failed to send email via Postmark:', errorBody);
        throw new Error(`Postmark API Error: ${errorBody.Message}`);
      }

      console.log('Email sent successfully via Postmark:', await response.json());

    } catch (error) {
      console.error('An error occurred while sending the email:', error);
      // Re-throw to allow caller to handle it
      throw error;
    }
  }
}
