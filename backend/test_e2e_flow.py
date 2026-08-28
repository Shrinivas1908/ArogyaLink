import urllib.request
import json

BASE = 'http://127.0.0.1:8000'

def run():
    print("--> Starting End-to-End Clinical Flow Test...")
    
    # 1. Start ABHA session
    req = urllib.request.Request(
        f'{BASE}/session/abha',
        data=json.dumps({'abha_id': '91-4820-9182-3491', 'pin': '1234', 'kiosk_id': 'kiosk-01'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        enc_data = json.loads(res.read().decode('utf-8'))
        enc_id = enc_data['encounter_id']
        print(f"[OK] 1. Session Started: {enc_id}")

    # 2. Record Consent
    req = urllib.request.Request(
        f'{BASE}/consent',
        data=json.dumps({'encounter_id': enc_id, 'consented': True, 'consent_version': 'v1.0'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        print(f"[OK] 2. Consent Recorded: {res.getcode()}")

    # 3. Submit Symptom Answer
    req = urllib.request.Request(
        f'{BASE}/intake/answer',
        data=json.dumps({
            'encounter_id': enc_id,
            'question_id': 'q_chief_complaint',
            'question_text': 'Primary symptom',
            'answer_value': ['chest_pain'],
            'category': 'chief_complaint'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        print(f"[OK] 3. Symptom Answered: {res.getcode()}")

    # 4. Generate AI Clinical Summary
    req = urllib.request.Request(
        f'{BASE}/summary/generate',
        data=json.dumps({'encounter_id': enc_id}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        summary = json.loads(res.read().decode('utf-8'))
        complaint = summary.get('chief_complaint') or summary.get('summary', {}).get('chief_complaint')
        print(f"[OK] 4. AI Clinical Summary (Groq/Gemini): {complaint}")

    # 5. Doctor Review Bundle
    req = urllib.request.Request(f'{BASE}/queue/encounter/{enc_id}/portal')
    with urllib.request.urlopen(req) as res:
        bundle = json.loads(res.read().decode('utf-8'))
        print(f"[OK] 5. Doctor Queue Bundle Received for: {bundle.get('patient_name')}")

    # 6. FHIR R4 Bundle Export
    req = urllib.request.Request(f'{BASE}/fhir/encounter/{enc_id}')
    with urllib.request.urlopen(req) as res:
        fhir = json.loads(res.read().decode('utf-8'))
        print(f"[OK] 6. FHIR R4 JSON Bundle Generated, resourceType: {fhir.get('resourceType')}")

    print("--> ALL END-TO-END CLINICAL STEPS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run()
