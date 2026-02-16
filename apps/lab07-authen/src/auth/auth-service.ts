import { Capacitor } from "@capacitor/core";
import { FirebaseWebAuthService } from "./auth-web";
import { FirebaseAppAuthService } from "./auth-app";

// เลือก Service ให้เหมาะสมกับ Platform อัตโนมัติ
export const authService = Capacitor.isNativePlatform()
    ? new FirebaseAppAuthService()  // สำหรับ Android / iOS
    : new FirebaseWebAuthService(); // สำหรับ Web Browser