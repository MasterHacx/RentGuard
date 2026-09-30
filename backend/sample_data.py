"""
Hardcoded sample data for RentGuard.

- SAMPLE_AGREEMENT: a realistic PG / rental agreement with deliberate red flags
  so judges can test the full flow in ~5 seconds.
- FALLBACK_RESPONSE: a pre-cached, schema-valid analysis of SAMPLE_AGREEMENT.
  Every `quote` below is an EXACT substring of SAMPLE_AGREEMENT so clause
  grounding still holds if both LLMs fail during a demo.

If you edit SAMPLE_AGREEMENT, re-check that each quote in FALLBACK_RESPONSE is
still an exact substring (see verify_fallback_quotes() at the bottom).
"""

DISCLAIMER = (
    "RentGuard is an educational tool, not a lawyer, and this is not legal "
    "advice. It explains clauses in plain language and points out things to "
    "check. For anything that affects your money or rights, confirm with a "
    "qualified lawyer before you sign."
)

SAMPLE_AGREEMENT = """PAYING GUEST ACCOMMODATION AGREEMENT

This Paying Guest Agreement is made on 1st August 2025 between Mr. Rajesh Kumar (hereinafter "the Owner") and the undersigned occupant (hereinafter "the Tenant") for the premises at Flat 3B, Sunshine Residency, Koramangala, Bengaluru.

1. RENT. The Tenant shall pay a monthly rent of Rs. 15,000 (Rupees Fifteen Thousand only), payable in advance on or before the 5th day of each month. A late fee of Rs. 500 per day shall apply for every day the rent is delayed.

2. SECURITY DEPOSIT. The Tenant shall pay a refundable security deposit of Rs. 1,50,000 (equal to ten months' rent) at the time of signing. The deposit shall be returned within 90 days of vacating, after deduction of any damages assessed solely by the Owner.

3. LOCK-IN PERIOD. This agreement has a mandatory lock-in period of 11 months. If the Tenant vacates before the lock-in period ends, the entire security deposit shall be forfeited and no portion shall be refunded.

4. NOTICE PERIOD. The Tenant must provide 3 months' written notice before vacating. The Owner may terminate this agreement and require the Tenant to vacate by giving 15 days' notice at the Owner's sole discretion.

5. MAINTENANCE AND REPAIRS. All repairs and maintenance, including plumbing, electrical fittings, and appliances provided by the Owner, shall be borne entirely by the Tenant regardless of the cause of damage.

6. ENTRY. The Owner or his representative may enter the premises at any time without prior notice to inspect the property or for any other reason the Owner deems fit.

7. GUESTS AND VISITORS. No guests or visitors of any kind are permitted inside the premises at any time. Violation of this clause shall result in immediate termination and forfeiture of the deposit.

8. RENT REVISION. The Owner reserves the right to increase the monthly rent by up to 20% at any point during the tenancy without the consent of the Tenant.

9. UTILITIES. Electricity and water charges are payable by the Tenant based on actual usage. A fixed maintenance charge of Rs. 2,000 per month is also payable.

10. GOVERNING TERMS. Any dispute arising out of this agreement shall be settled at the sole discretion of the Owner, and the Tenant waives the right to approach any consumer forum or court.
"""


FALLBACK_RESPONSE = {
    "disclaimer": DISCLAIMER,
    "key_terms": {
        "rent": {
            "value": "Rs. 15,000 per month, due on/before the 5th",
            "quote": "The Tenant shall pay a monthly rent of Rs. 15,000 (Rupees Fifteen Thousand only), payable in advance on or before the 5th day of each month.",
            "notes": "A late fee of Rs. 500 per day also applies, which adds up fast.",
        },
        "security_deposit": {
            "value": "Rs. 1,50,000 (about ten months' rent)",
            "quote": "The Tenant shall pay a refundable security deposit of Rs. 1,50,000 (equal to ten months' rent) at the time of signing.",
            "notes": "Ten months' rent is very high; two to three months is more typical.",
        },
        "lock_in_period": {
            "value": "11 months",
            "quote": "This agreement has a mandatory lock-in period of 11 months.",
            "notes": "Leaving early forfeits the entire deposit.",
        },
        "notice_period": {
            "value": "Tenant: 3 months; Owner: 15 days",
            "quote": "The Tenant must provide 3 months' written notice before vacating.",
            "notes": "The notice periods are unequal and heavily favour the Owner.",
        },
        "repairs_maintenance": {
            "value": "All repairs borne by the Tenant",
            "quote": "All repairs and maintenance, including plumbing, electrical fittings, and appliances provided by the Owner, shall be borne entirely by the Tenant regardless of the cause of damage.",
            "notes": "You may be charged even for normal wear and tear or the Owner's own appliances.",
        },
    },
    "risk_flags": [
        {
            "severity": "High",
            "title": "Deposit can be fully forfeited if you leave during lock-in",
            "quote": "If the Tenant vacates before the lock-in period ends, the entire security deposit shall be forfeited and no portion shall be refunded.",
            "explanation": "If your plans change and you move out before 11 months, you lose the whole Rs. 1,50,000 deposit. That is a huge penalty tied to a long lock-in.",
            "recommendation": "Ask to reduce the lock-in or cap the penalty to one or two months' rent, and get it in writing.",
            "consult_lawyer": True,
        },
        {
            "severity": "High",
            "title": "Very unequal notice periods",
            "quote": "The Owner may terminate this agreement and require the Tenant to vacate by giving 15 days' notice at the Owner's sole discretion.",
            "explanation": "You must give 3 months' notice, but the Owner can ask you to leave in just 15 days. This leaves you with little time to find a new place.",
            "recommendation": "Ask for symmetric notice periods (for example, one month on both sides).",
            "consult_lawyer": True,
        },
        {
            "severity": "High",
            "title": "Waiver of your right to go to court or consumer forum",
            "quote": "the Tenant waives the right to approach any consumer forum or court.",
            "explanation": "This tries to stop you from seeking legal help if something goes wrong. Such waivers are often not enforceable, but signing one is a serious red flag.",
            "recommendation": "Do not accept this clause. This is exactly the kind of term a lawyer should review.",
            "consult_lawyer": True,
        },
        {
            "severity": "Medium",
            "title": "Owner can enter any time without notice",
            "quote": "The Owner or his representative may enter the premises at any time without prior notice to inspect the property or for any other reason the Owner deems fit.",
            "explanation": "This gives the Owner unrestricted access to your room, which affects your privacy and safety.",
            "recommendation": "Ask for reasonable prior notice (for example, 24 hours) except in emergencies.",
            "consult_lawyer": False,
        },
        {
            "severity": "Medium",
            "title": "Rent can be raised up to 20% at any time",
            "quote": "The Owner reserves the right to increase the monthly rent by up to 20% at any point during the tenancy without the consent of the Tenant.",
            "explanation": "Your rent could jump by 20% mid-tenancy without your agreement, making your costs unpredictable.",
            "recommendation": "Ask to cap increases (for example, once a year, tied to a fixed percentage) and require written notice.",
            "consult_lawyer": False,
        },
        {
            "severity": "Medium",
            "title": "All repairs pushed onto the tenant",
            "quote": "All repairs and maintenance, including plumbing, electrical fittings, and appliances provided by the Owner, shall be borne entirely by the Tenant regardless of the cause of damage.",
            "explanation": "You could be billed for fixing the Owner's own appliances or normal wear and tear, not just damage you caused.",
            "recommendation": "Ask that the Owner cover structural repairs and their own fittings; you cover only damage you cause.",
            "consult_lawyer": False,
        },
        {
            "severity": "Low",
            "title": "No visitors allowed at all",
            "quote": "No guests or visitors of any kind are permitted inside the premises at any time.",
            "explanation": "A blanket no-visitor rule is restrictive, and breaking it here can cost you your deposit.",
            "recommendation": "Clarify a reasonable visitor policy in writing before signing.",
            "consult_lawyer": False,
        },
    ],
    "questions_for_landlord": [
        "Can we reduce the lock-in period, or cap the penalty for leaving early to one or two months' rent instead of the full deposit?",
        "Can the notice period be the same for both of us, for example one month each?",
        "What is the exact, itemised process and timeline for returning my Rs. 1,50,000 deposit?",
        "Can we agree that you handle repairs to your own appliances and structural issues, and I only pay for damage I cause?",
        "Can I get reasonable prior notice (say 24 hours) before you enter my room, except in emergencies?",
        "Can we cap rent increases to once a year at a fixed percentage, with written notice?",
        "Is the clause waiving my right to approach a court or consumer forum something you're willing to remove?",
    ],
    "presigning_checklist": [
        {"item": "Confirm the rent amount, due date, and late-fee terms in writing", "done": False},
        {"item": "Get the full deposit amount and refund timeline documented", "done": False},
        {"item": "Understand the lock-in period and the exact penalty for leaving early", "done": False},
        {"item": "Check that notice periods are fair to both sides", "done": False},
        {"item": "Clarify who pays for which repairs and maintenance", "done": False},
        {"item": "Agree on notice before the Owner can enter your room", "done": False},
        {"item": "Take dated photos of the room's condition on move-in day", "done": False},
        {"item": "Get a signed copy of the final agreement for your own records", "done": False},
        {"item": "Have a lawyer review any clause that removes your legal rights", "done": False},
    ],
    "_meta": {"model": "sample-fallback", "source": "cached"},
}


def verify_fallback_quotes():
    """Return a list of quotes in FALLBACK_RESPONSE that are NOT exact
    substrings of SAMPLE_AGREEMENT. An empty list means clause grounding holds.
    Handy to run after editing the sample text."""
    missing = []
    for term, data in FALLBACK_RESPONSE["key_terms"].items():
        q = data.get("quote", "")
        if q and q not in SAMPLE_AGREEMENT:
            missing.append(("key_terms." + term, q))
    for i, flag in enumerate(FALLBACK_RESPONSE["risk_flags"]):
        q = flag.get("quote", "")
        if q and q not in SAMPLE_AGREEMENT:
            missing.append(("risk_flags[%d]" % i, q))
    return missing


if __name__ == "__main__":
    problems = verify_fallback_quotes()
    if problems:
        print("QUOTES NOT FOUND IN SAMPLE (fix these):")
        for where, q in problems:
            print(" -", where, "->", q[:60], "...")
    else:
        print("OK: all fallback quotes are exact substrings of the sample agreement.")
