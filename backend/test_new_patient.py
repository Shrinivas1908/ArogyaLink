import urllib.request
import json

BASE = 'http://127.0.0.1:8000'

def test():
    # 1. New patient check-in
    req = urllib.request.Request(
        f'{BASE}/session',
        data=json.dumps({
            'full_name': 'Priya Patel',
            'age': 29,
            'gender': 'Female',
            'phone': '+91 98765 00112'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        enc_data = json.loads(res.read().decode('utf-8'))
        enc_id = enc_data['encounter_id']
        print(f"[OK] Created new patient: {enc_data.get('full_name')} -> Encounter {enc_id}")

    # 2. Consent
    req = urllib.request.Request(
        f'{BASE}/consent',
        data=json.dumps({'encounter_id': enc_id, 'consented': True, 'consent_version': 'v1.0'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        print(f"[OK] Consent recorded: {res.getcode()}")

    # 3. Answer symptom
    req = urllib.request.Request(
        f'{BASE}/intake/answer',
        data=json.dumps({
            'encounter_id': enc_id,
            'question_id': 'q_chief_complaint',
            'question_text': 'Primary Complaint',
            'answer_value': ['high_fever', 'severe_headache'],
            'category': 'chief_complaint'
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        print(f"[OK] Answer submitted: {res.getcode()}")

    # 4. Check queue
    req = urllib.request.Request(f'{BASE}/queue/encounters/portal')
    with urllib.request.urlopen(req) as res:
        queue = json.loads(res.read().decode('utf-8'))
        print(f"[OK] Queue total count: {len(queue)}")
        for item in queue[:5]:
            print(f"   -> {item['patient_name']} ({item['age']} yrs) | Complaint: {item['chief_complaint']} | Triage: {item['triage_level']} | ID: {item['id'][:8]}")

if __name__ == '__main__':
    test()
