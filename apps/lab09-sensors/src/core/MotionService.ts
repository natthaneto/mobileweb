import { Motion } from "@capacitor/motion";
import type { AccelSample } from "./types";

export class MotionService {
  private remove?: () => void;

  /**
   * ฟังก์ชันสำหรับขออนุญาตเข้าถึง Sensor สำหรับ iOS 13+
   * ต้องถูกเรียกจากการกระทำของผู้ใช้ (User Gesture) เช่น การกดปุ่มเท่านั้น
   */
  async requestPermission(): Promise<boolean> {
    // ตรวจสอบว่า Browser/WebView รองรับคำสั่งขออนุญาตหรือไม่
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        // เรียกหน้าต่าง Pop-up ของ iOS ขึ้นมาถามผู้ใช้
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        
        if (permissionState === 'granted') {
          console.log("Motion permission granted.");
          return true;
        } else {
          console.warn("Motion permission denied by user.");
          return false;
        }
      } catch (error) {
        console.error("Error requesting motion permission:", error);
        return false;
      }
    } else {
      // สำหรับ Android หรือ iOS รุ่นเก่าที่ไม่ได้ใช้ระบบคำสั่งนี้
      // หรือกรณีที่รันผ่าน Capacitor Plugin โดยตรงที่จัดการ Permission ให้แล้ว
      return true;
    }
  }

  /**
   * เริ่มต้นการดึงข้อมูลจาก Accelerometer
   * @param cb Callback ฟังก์ชันที่จะส่งข้อมูล AccelSample กลับไปให้ Engine
   */
  async start(cb: (s: AccelSample) => void): Promise<void> {
    // ตรวจสอบ/ขอสิทธิ์ก่อนเริ่มเสมอ
    const isAllowed = await this.requestPermission();
    if (!isAllowed) {
      throw new Error("Permission for Motion Sensors was not granted.");
    }

    // ลงทะเบียน Listener เพื่อรับค่าความเร่งรวมแรงโน้มถ่วง (ay บน iPhone คือแนวตั้ง)
    const handler = await Motion.addListener("accel", (event) => {
      const a = event.accelerationIncludingGravity;
      if (!a) return;

      // ส่งข้อมูลเข้าสู่ Callback เพื่อให้ Engine ไปประมวลผลต่อ
      cb({
        ax: a.x ?? 0,
        ay: a.y ?? 0,
        az: a.z ?? 0,
        t: Date.now(),
      });
    });

    // เก็บฟังก์ชันสำหรับหยุดรับข้อมูลไว้ในตัวแปร private
    this.remove = () => {
      handler.remove();
    };
  }

  /**
   * หยุดการดึงข้อมูลเซนเซอร์
   */
  async stop(): Promise<void> {
    if (this.remove) {
      this.remove();
      this.remove = undefined;
    }
  }
}