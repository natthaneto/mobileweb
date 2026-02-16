// 1. นำเข้าเฉพาะสิ่งที่ต้องใช้ (ลบ initializeApp ออก)
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";

// 2. สำคัญมาก: นำเข้า auth ที่ตั้งค่าเสร็จแล้วจากไฟล์ firebase.ts ของเรา
import { auth } from "../firebase"; 

import { AuthUser, EmailPasswordCredentials, IAuthService, PhoneCredentials } from "./auth-interface";

// --- ลบส่วน firebaseConfig และ initializeApp ของเดิมทิ้งทั้งหมด ---

export class FirebaseWebAuthService implements IAuthService {
  private confirmationResult: ConfirmationResult | null = null;

  async getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      // ใช้ auth ที่ import มา
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoURL,
            phoneNumber: user.phoneNumber
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async loginWithEmailPassword(creds: EmailPasswordCredentials): Promise<AuthUser> {
    const res = await signInWithEmailAndPassword(auth, creds.email, creds.password);
    return { uid: res.user.uid, email: res.user.email };
  }

  async loginWithGoogle(): Promise<AuthUser> {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    return { uid: res.user.uid, email: res.user.email, displayName: res.user.displayName };
  }

  async startPhoneLogin(creds: PhoneCredentials): Promise<{ verificationId: string }> {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    this.confirmationResult = await signInWithPhoneNumber(auth, creds.phoneNumberE164, verifier);
    return { verificationId: this.confirmationResult.verificationId };
  }

  async confirmPhoneCode(payload: { verificationId: string; verificationCode: string }): Promise<AuthUser> {
    if (!this.confirmationResult) throw new Error("No confirmation result");
    const res = await this.confirmationResult.confirm(payload.verificationCode);
    return { uid: res.user.uid, phoneNumber: res.user.phoneNumber };
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }
}