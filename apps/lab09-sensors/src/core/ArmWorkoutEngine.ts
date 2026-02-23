import type { AccelSample, WorkoutState } from "./types";
import { HapticsService } from "./HapticsService";
import { TtsService } from "./TtsService";

export class ArmWorkoutEngine {
  private listeners = new Set<(s: WorkoutState) => void>();
  private haptics = new HapticsService();
  private tts = new TtsService();

  // ตัวแปรสำหรับ Algorithm
  private lastRepTime = 0;
  private peak = -99;
  private valley = 99;
  private phase: "WAIT_UP" | "WAIT_DOWN" = "WAIT_UP";

  state: WorkoutState = {
    status: "IDLE",
    repDisplay: 0,
    stats: {
      repsTotal: 0,
      repsOk: 0,
      repsBad: 0,
      score: 0,
      avgRepMs: 0,
      lastMessage: "พร้อมเริ่ม",
    },
  };

  onChange(cb: (s: WorkoutState) => void) {
    this.listeners.add(cb);
    cb(this.clone());
    return () => this.listeners.delete(cb);
  }

  private emit() {
    this.listeners.forEach((cb) => cb(this.clone()));
  }

  private clone(): WorkoutState {
    // ใช้ JSON parse/stringify เพื่อป้องกันการอ้างอิง object เดิม (Deep Clone)
    return JSON.parse(JSON.stringify(this.state));
  }

  start() {
    this.state.status = "RUNNING";
    this.state.repDisplay = 0;
    this.state.stats = {
      repsTotal: 0,
      repsOk: 0,
      repsBad: 0,
      score: 0,
      avgRepMs: 0,
      lastMessage: "เริ่มได้!",
    };
    this.phase = "WAIT_UP";
    this.peak = -99;
    this.valley = 99;
    this.lastRepTime = Date.now();
    this.emit();
  }

  stop() {
    this.state.status = "STOPPED";
    this.emit();
  }

  /**
   * ประมวลผลข้อมูลจาก Sensor
   * บน iOS ค่า ay (Including Gravity) เมื่อถือเครื่องแนวตั้งจะเริ่มที่ประมาณ 9.8
   */
  async process(sample: AccelSample) {
    if (this.state.status !== "RUNNING") return;

    const y = sample.ay;
    const side = Math.abs(sample.ax) + Math.abs(sample.az); // วัดการแกว่งซ้ายขวา/หน้าหลัง

    // บันทึกจุดสูงสุดต่ำสุดที่เจอในรอบนั้น
    if (y > this.peak) this.peak = y;
    if (y < this.valley) this.valley = y;

    // --- RULE-BASED ALGORITHM ---
    
    // จังหวะที่ 1: รอให้ยกแขนขึ้น (Y เพิ่มขึ้น)
    if (this.phase === "WAIT_UP") {
      // ถ้า Y สูงกว่าจุดต่ำสุดเกิน 2.0 หน่วย (เริ่มมีการเคลื่อนที่ขึ้น)
      if (y > this.valley + 2.0) {
        this.phase = "WAIT_DOWN";
        this.haptics.success(); // สั่นเบาๆ ให้รู้ว่าระบบตรวจเจอการยกแล้ว
      }
    } 
    // จังหวะที่ 2: รอให้ลดแขนลง (Y ลดลงกลับมา)
    else if (this.phase === "WAIT_DOWN") {
      // ถ้า Y ต่ำกว่าจุดสูงสุดเกิน 2.0 หน่วย (แขนกลับมาที่เดิม)
      if (y < this.peak - 2.0) {
        const now = Date.now();
        const repMs = now - this.lastRepTime;
        const rom = this.peak - this.valley; // ช่วงกว้างการขยับ (Range of Motion)

        let ok = true;
        let msg = "OK";

        // ตรวจสอบเงื่อนไขตามโจทย์ (Rule-based)
        if (rom < 3.5) { 
          ok = false; 
          msg = "ยกแขนไม่สุด"; 
        } else if (repMs < 700) { 
          ok = false; 
          msg = "เร็วเกินไป"; 
        } else if (side > 6.0) { 
          ok = false; 
          msg = "กรุณายกแนวตั้ง"; 
        }

        this.state.stats.repsTotal++;
        
        if (ok) {
          this.state.repDisplay++;
          this.state.stats.repsOk++;
          this.state.stats.score++;
          this.haptics.success(); // สั่นยืนยันความสำเร็จ
        } else {
          this.state.stats.repsBad++;
          this.haptics.warning(); // สั่นเตือน
          this.tts.speak(msg);    // พูดเตือนความผิดพลาด
        }

        this.state.stats.lastMessage = msg;
        this.lastRepTime = now;
        
        // รีเซ็ตเพื่อรอรับรอบถัดไป
        this.phase = "WAIT_UP";
        this.peak = y;
        this.valley = y;
        this.emit();
      }
    }
  }
}