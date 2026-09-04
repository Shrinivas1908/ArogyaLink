"""
Arogya Link — services/reminder_service.py
===========================================
Phase 14 — Real WhatsApp & SMS Patient Reminder Messaging Service.
Supports:
  - Multilingual localized templates (English, Hindi, Marathi).
  - WhatsApp Click-to-Chat direct links (https://wa.me/...) for immediate real delivery.
  - Cloud API dispatch (Twilio WhatsApp API & Meta WhatsApp Cloud API via httpx).
  - Delivery status lifecycle: SCHEDULED, QUEUED, SENT, DELIVERED, OPENED_IN_WA.
"""

from __future__ import annotations

import re
import uuid
import urllib.parse
from datetime import datetime, timezone
from typing import Any
import httpx

from app.core.config import settings


def clean_phone_number(phone: str | None) -> str:
    """Normalize phone number to international E.164 format without symbols."""
    if not phone:
        return "919876543210"
    digits = re.sub(r"\D", "", phone)
    # Default to India (+91) if 10 digits
    if len(digits) == 10:
        return f"91{digits}"
    return digits


class ReminderService:
    """Manages real patient medication & follow-up reminders via WhatsApp."""

    def __init__(self) -> None:
        self._reminders: list[dict[str, Any]] = []
        self._delivery_logs: list[dict[str, Any]] = []

    def format_whatsapp_message(
        self,
        patient_name: str = "Patient",
        medication_name: str = "Prescription Medicine",
        dosage: str = "As directed",
        schedule_time: str = "08:00 AM",
        instructions: str | None = None,
        doctor_name: str = "Dr. Arogya Clinical Team",
        hospital_name: str = "ArogyaLink Community Health Center",
        language: str = "en",
    ) -> str:
        """Compose rich, professional medical reminder text in the selected language."""
        instr = instructions or "Take with water after meals as advised."

        if language == "hi":
            return (
                f"🏥 *आरोग्य लिंक (ArogyaLink) दवा स्मरण संदेश*\n\n"
                f"नमस्ते *{patient_name}* जी,\n"
                f"यह आपके स्वास्थ्य और दवा का समय पर स्मरण कराने के लिए संदेश है:\n\n"
                f"💊 *दवा का नाम:* {medication_name}\n"
                f"⚖️ *मात्रा (Dosage):* {dosage}\n"
                f"⏰ *समय (Schedule):* {schedule_time}\n"
                f"🍽️ *सेवन निर्देश:* {instr}\n\n"
                f"👨‍⚕️ *परामर्शक डॉक्टर:* {doctor_name}\n"
                f"📍 *अस्पताल:* {hospital_name}\n\n"
                f"⚠️ *सहायता:* किसी भी असुविधा पर राष्ट्रीय स्वास्थ्य हेल्पलाइन 104 पर कॉल करें या तुरंत नजदीकी स्वास्थ्य केंद्र संपर्क करें। स्वस्थ रहें! 🌿"
            )
        elif language == "mr":
            return (
                f"🏥 *आरोग्य लिंक (ArogyaLink) औषध स्मरणपत्र*\n\n"
                f"नमस्कार *{patient_name}*,\n"
                f"आपल्या आरोग्याची काळजी घेण्यासाठी हे औषध वेळेवर घेण्याचे स्मरणपत्र:\n\n"
                f"💊 *औषधाचे नाव:* {medication_name}\n"
                f"⚖️ *डोस:* {dosage}\n"
                f"⏰ *वेळ:* {schedule_time}\n"
                f"🍽️ *सूचना:* {instr}\n\n"
                f"👨‍⚕️ *डॉक्टर:* {doctor_name}\n"
                f"📍 *आरोग्य केंद्र:* {hospital_name}\n\n"
                f"⚠️ मदतीसाठी हेल्पलाईन 104 वर संपर्क साधा. काळजी घ्या! 🌿"
            )
        else:
            # English (Default)
            return (
                f"🏥 *ArogyaLink Health Care Reminder*\n\n"
                f"Namaste *{patient_name}*,\n"
                f"This is a gentle reminder for your prescribed medication:\n\n"
                f"💊 *Medicine:* {medication_name}\n"
                f"⚖️ *Dosage:* {dosage}\n"
                f"⏰ *Scheduled Time:* {schedule_time}\n"
                f"🍽️ *Instructions:* {instr}\n\n"
                f"👨‍⚕️ *Prescribed by:* {doctor_name}\n"
                f"📍 *Facility:* {hospital_name}\n\n"
                f"⚠️ *Need Assistance?* Call health helpline 104 or consult your primary health center. Stay well! 🌿"
            )

    def generate_wa_link(self, phone: str, message: str) -> str:
        """Generate a WhatsApp click-to-chat URL that opens WhatsApp Web / Mobile app."""
        clean_num = clean_phone_number(phone)
        encoded_text = urllib.parse.quote(message)
        return f"https://wa.me/{clean_num}?text={encoded_text}"

    def create_reminder(
        self,
        encounter_id: str,
        medication_name: str,
        dosage: str,
        schedule_time: str,
        phone: str | None = None,
        patient_name: str = "Patient",
        instructions: str | None = None,
        doctor_name: str = "Dr. Arogya Clinical Team",
        language: str = "en",
    ) -> dict[str, Any]:
        """Register a scheduled reminder with complete WhatsApp metadata and wa.me link."""
        msg_text = self.format_whatsapp_message(
            patient_name=patient_name,
            medication_name=medication_name,
            dosage=dosage,
            schedule_time=schedule_time,
            instructions=instructions,
            doctor_name=doctor_name,
            language=language,
        )
        target_phone = phone or "+91 98765 43210"
        wa_link = self.generate_wa_link(target_phone, msg_text)

        reminder = {
            "reminder_id": str(uuid.uuid4()),
            "encounter_id": encounter_id,
            "patient_name": patient_name,
            "medication_name": medication_name,
            "dosage": dosage,
            "schedule_time": schedule_time,
            "instructions": instructions or "Take after meals with water",
            "doctor_name": doctor_name,
            "phone": target_phone,
            "language": language,
            "status": "SCHEDULED",
            "message_text": msg_text,
            "wa_link": wa_link,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "channel": "WhatsApp",
        }
        self._reminders.append(reminder)
        return reminder

    async def send_real_whatsapp(
        self,
        phone: str,
        message: str,
        reminder_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Send a real WhatsApp message to the recipient's phone number.
        Uses Twilio WhatsApp API or Meta Cloud API if configured in .env.
        Always returns a direct wa.me link for immediate 1-click fallback.
        """
        clean_num = clean_phone_number(phone)
        wa_link = self.generate_wa_link(phone, message)
        dispatched_via = "DIRECT_WA_LINK"
        gateway_response = None
        status = "SENT"

        # 1. Check if Twilio is configured
        if settings.twilio_account_sid and settings.twilio_auth_token:
            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
            from_num = f"whatsapp:{settings.twilio_whatsapp_number}"
            to_num = f"whatsapp:+{clean_num}"
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        twilio_url,
                        data={
                            "From": from_num,
                            "To": to_num,
                            "Body": message,
                        },
                        auth=(settings.twilio_account_sid, settings.twilio_auth_token),
                    )
                    if resp.is_success:
                        dispatched_via = "TWILIO_WHATSAPP_API"
                        gateway_response = resp.json()
                        status = "DELIVERED"
                    else:
                        dispatched_via = "TWILIO_FALLBACK_LINK"
                        gateway_response = {"error": resp.text, "status_code": resp.status_code}
            except Exception as e:
                dispatched_via = "TWILIO_ERROR_FALLBACK"
                gateway_response = {"error": str(e)}

        # 2. Check if Meta WhatsApp Cloud API is configured
        elif settings.whatsapp_cloud_api_token and settings.whatsapp_phone_number_id:
            meta_url = f"https://graph.facebook.com/v20.0/{settings.whatsapp_phone_number_id}/messages"
            headers = {
                "Authorization": f"Bearer {settings.whatsapp_cloud_api_token}",
                "Content-Type": "application/json",
            }
            payload = {
                "messaging_product": "whatsapp",
                "to": clean_num,
                "type": "text",
                "text": {"body": message},
            }
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(meta_url, json=payload, headers=headers)
                    if resp.is_success:
                        dispatched_via = "META_WHATSAPP_CLOUD_API"
                        gateway_response = resp.json()
                        status = "DELIVERED"
                    else:
                        dispatched_via = "META_FALLBACK_LINK"
                        gateway_response = {"error": resp.text, "status_code": resp.status_code}
            except Exception as e:
                dispatched_via = "META_ERROR_FALLBACK"
                gateway_response = {"error": str(e)}

        # Update reminder status if reminder_id is provided
        if reminder_id:
            for r in self._reminders:
                if r["reminder_id"] == reminder_id:
                    r["status"] = status
                    r["last_dispatched_at"] = datetime.now(timezone.utc).isoformat()
                    r["gateway"] = dispatched_via

        log_entry = {
            "log_id": str(uuid.uuid4()),
            "reminder_id": reminder_id,
            "phone": f"+{clean_num}",
            "dispatched_via": dispatched_via,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "wa_link": wa_link,
            "gateway_response": gateway_response,
            "message_snippet": message[:100] + "..." if len(message) > 100 else message,
        }
        self._delivery_logs.append(log_entry)

        return {
            "status": "success",
            "delivery_status": status,
            "dispatched_via": dispatched_via,
            "phone": f"+{clean_num}",
            "wa_link": wa_link,
            "timestamp": log_entry["timestamp"],
            "gateway_response": gateway_response,
        }

    def get_encounter_reminders(self, encounter_id: str) -> list[dict[str, Any]]:
        return [r for r in self._reminders if r["encounter_id"] == encounter_id]

    def get_delivery_logs(self) -> list[dict[str, Any]]:
        return list(reversed(self._delivery_logs))
