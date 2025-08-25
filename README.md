Health Record Portal

A fullstack Next.js 14 application for centralized healthcare management with patient and doctor dashboards.

Features
🏥 Two Role-Based Dashboards

Patient Dashboard: Manage health records, generate QR codes, control data access

Doctor Dashboard: Access patient records, write prescriptions, scan QR codes

🔐 Authentication & Security

Separate registration/login for patients and doctors

Session management with localStorage

Consent-based access control

Comprehensive audit logging

📱 QR Code Integration

Patients can generate time-limited QR codes for secure data sharing

Doctors can scan QR codes or enter HCID manually

Automatic token verification and expiration

📊 Data Management

Health records management for patients

Prescription writing for doctors

Consent management and approval flow

Activity audit trails

Tech Stack

Framework: Next.js 14 with App Router

Styling: Tailwind CSS with custom light yellow theme

Icons: Lucide React

Blockchain Storage:

Polygon (for storing metadata + transaction proofs)

Pinata (IPFS) (for decentralized storage of encrypted health records)

Local Mock Storage: localStorage (for demo & session handling)

QR Codes: Custom SVG generation

Authentication: Custom JWT-like sessions

Database & Blockchain Layer
Hybrid Data Model:

Pinata (IPFS) → Stores encrypted health records & prescriptions off-chain (immutable storage).

Polygon Blockchain → Stores metadata, HCIDs, access tokens, consent hashes, and transaction logs for integrity and transparency.

localStorage (Demo Mode) → Used only for quick testing without blockchain.

Collections:

users - User accounts (patients & doctors)

patients - Patient profiles & records (encrypted → stored in Pinata, reference hash in Polygon)

doctors - Doctor profiles

consents - Blockchain-verified permissions between patients & doctors

prescriptions - Prescriptions stored via IPFS (hash on Polygon)

audits - Audit logs anchored on-chain

qrTokens - QR tokens with expiration, verified via smart contract

Security Features

Encrypted storage of sensitive data before uploading to Pinata

Polygon smart contracts ensure:

Role-based access control

Consent validation before record retrieval

Immutable audit trails of data access and prescriptions

QR tokens verified on-chain with expiration logic

Development Notes

This is a demo application with the following notes:

Default demo uses localStorage only

Blockchain + Pinata requires:

A Polygon Mumbai/Testnet account & smart contract deployment

Pinata API key for IPFS storage

Future expansion:

Move full authentication & data to blockchain + IPFS

Add wallet-based login (MetaMask)

Enable multi-sig access for sensitive data
