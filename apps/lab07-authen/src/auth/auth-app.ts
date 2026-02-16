import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { AuthUser, EmailPasswordCredentials, IAuthService, PhoneCredentials } from "./auth-interface";

export class FirebaseAppAuthService implements IAuthService {
  
  async getCurrentUser(): Promise<AuthUser | null> {
    const res = await FirebaseAuthentication.getCurrentUser();
    if (res.user) {
      return {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoUrl: res.user.photoUrl,
        phoneNumber: res.user.phoneNumber
      };
    }
    return null;
  }

  async loginWithEmailPassword(creds: EmailPasswordCredentials): Promise<AuthUser> {
    const res = await FirebaseAuthentication.signInWithEmailAndPassword({
      email: creds.email,
      password: creds.password
    });
    return { uid: res.user!.uid, email: res.user!.email };
  }

  async loginWithGoogle(): Promise<AuthUser> {
    const res = await FirebaseAuthentication.signInWithGoogle();
    return { uid: res.user!.uid, email: res.user!.email, displayName: res.user!.displayName };
  }

  async startPhoneLogin(creds: PhoneCredentials): Promise<{ verificationId: string }> {
    // สำหรับ Native จะเป็นการส่งรหัสผ่าน FirebaseAuthentication โดยตรง
    // และรอรับ event phoneCodeSent (ตามที่ระบุใน lab หน้า 6-7)
    await FirebaseAuthentication.signInWithPhoneNumber({
      phoneNumber: creds.phoneNumberE164
    });
    return { verificationId: "" }; // Native จัดการ ID ภายใน plugin
  }

  async confirmPhoneCode(payload: { verificationId: string; verificationCode: string }): Promise<AuthUser> {
    // ใน Native มักใช้เมธอดการยืนยันรหัส OTP
    throw new Error("Phone confirmation on Native requires specific event listener implementation as per lab doc.");
  }

  async logout(): Promise<void> {
    await FirebaseAuthentication.signOut();
  }
}