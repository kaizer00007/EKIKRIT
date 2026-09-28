import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ekikrit_super_secure_jwt_secret_sih2026';

/**
 * Federated Identity (SSO) Service
 * Simulates national Aadhaar / DigiLocker Single Sign-On flow.
 */
export class AuthService {
  constructor() {
    this.otpStore = new Map(); // phone/identifier -> { otp, expiresAt, unifiedId, role }
    
    // Preset Demo Personas for 1-click quick evaluation during live judge demo
    this.demoPersonas = [
      {
        id: 'persona-rajesh',
        name: 'Rajesh Tukaram Patil',
        role: 'citizen',
        unifiedId: 'EK-MH-849102',
        phone: '9822019482',
        aadhaarMasked: 'XXXX-XXXX-9482',
        description: 'Multi-Department Overlap, Pending Consent Request & Anomaly (Antyodaya vs 12.8 Hec Land)',
        avatarColor: 'bg-blue-600'
      },
      {
        id: 'persona-sunita',
        name: 'Sunita Ramesh Deshmukh',
        role: 'citizen',
        unifiedId: 'EK-MH-849103',
        phone: '9823456711',
        aadhaarMasked: 'XXXX-XXXX-6711',
        description: 'Approved DEPA Consent, Active Beneficiary across PDS, MahaBhumi & Mahaswayam',
        avatarColor: 'bg-teal-600'
      },
      {
        id: 'persona-amol',
        name: 'Amol Vitthal Shinde',
        role: 'citizen',
        unifiedId: 'EK-MH-849104',
        phone: '9765432109',
        aadhaarMasked: 'XXXX-XXXX-2109',
        description: 'Pending Application Tracker Demo & Borderline Entity Match Candidate',
        avatarColor: 'bg-indigo-600'
      },
      {
        id: 'persona-official-land',
        name: 'Shri S. K. Kadam (Tehsildar)',
        role: 'official',
        departmentId: 'dept-land-records',
        departmentName: 'Revenue Dept (MahaBhumi)',
        email: 'tehsildar.haveli@maharashtra.gov.in',
        description: 'Official view: Cross-checks PDS data with DEPA consent enforcement',
        avatarColor: 'bg-amber-600'
      },
      {
        id: 'persona-admin',
        name: 'GovTech Integration Admin',
        role: 'admin',
        email: 'admin.ekikrit@maharashtra.gov.in',
        description: 'System Admin: Adapter live onboarding, downtime simulation & AI mapping studio',
        avatarColor: 'bg-rose-600'
      }
    ];
  }

  getDemoPersonas() {
    return this.demoPersonas;
  }

  /**
   * Generates simulated 6-digit OTP
   */
  requestOtp(identifier) {
    const otp = '123456'; // Standardized for zero-friction demo testing
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Find if identifier maps to any persona
    const persona = this.demoPersonas.find(
      p => p.phone === identifier || p.unifiedId === identifier || p.email === identifier
    ) || {
      name: 'Registered Citizen',
      role: 'citizen',
      unifiedId: 'EK-MH-849102'
    };

    this.otpStore.set(identifier, {
      otp,
      expiresAt,
      persona
    });

    return {
      success: true,
      identifier,
      simulatedOtp: otp,
      message: `Simulated SMS sent to ${identifier}. Use OTP: ${otp} (prefilled for instant demo).`
    };
  }

  /**
   * Verifies OTP and issues signed JWT carrying unified citizen claims
   */
  verifyOtp(identifier, submittedOtp) {
    const entry = this.otpStore.get(identifier);
    
    // Fallback if test mode OTP is submitted directly
    const validOtp = entry ? entry.otp : '123456';
    if (submittedOtp !== validOtp) {
      throw new Error('Invalid OTP. For demo purposes, please enter: 123456');
    }

    const persona = entry ? entry.persona : (
      this.demoPersonas.find(p => p.phone === identifier || p.unifiedId === identifier) || this.demoPersonas[0]
    );

    const tokenPayload = {
      unifiedId: persona.unifiedId || null,
      name: persona.name,
      role: persona.role,
      departmentId: persona.departmentId || null,
      departmentName: persona.departmentName || null,
      email: persona.email || null,
      phone: persona.phone || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

    return {
      token,
      user: tokenPayload
    };
  }

  /**
   * 1-Click Persona Login
   */
  quickLogin(personaId) {
    const persona = this.demoPersonas.find(p => p.id === personaId);
    if (!persona) throw new Error('Invalid demo persona ID');

    const tokenPayload = {
      unifiedId: persona.unifiedId || null,
      name: persona.name,
      role: persona.role,
      departmentId: persona.departmentId || null,
      departmentName: persona.departmentName || null,
      email: persona.email || null,
      phone: persona.phone || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

    return {
      token,
      user: tokenPayload
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired authentication token: ' + err.message);
    }
  }
}

export const authServiceInstance = new AuthService();
