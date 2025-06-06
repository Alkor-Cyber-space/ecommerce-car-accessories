from twilio.rest import Client
from django.conf import settings

def send_otp_via_twilio(phone_number):
     client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
     verification = client.verify.v2.services(settings.TWILIO_VERIFY_SID).verifications.create(
          to=phone_number,
          channel='sms'
     )
     return verification.status  # returns 'pending'

def verify_otp_via_twilio(phone_number, code):
     client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
     verification_check = client.verify.v2.services(settings.TWILIO_VERIFY_SID).verification_checks.create(
          to=phone_number,
          code=code
     )
     return verification_check.status  # returns 'approved' or 'pending'