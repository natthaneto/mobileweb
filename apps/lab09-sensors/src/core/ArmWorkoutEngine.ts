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
   * ฟังก์ชันช่วยรีเซ็ตค่ารอบการขยับ
   */
  private resetCycle(currentY: number) {
    this.phase = "WAIT_UP";
    this.peak = currentY;
    this.valley = currentY;
    this.emit();
  }

  /**
   * ประมวลผลข้อมูลจาก Sensor (เวอร์ชันยืดหยุ่นพิเศษสำหรับ iPhone)
   */
  async process(sample: AccelSample) {
    if (this.state.status !== "RUNNING") return;

    const y = sample.ay;
    const side = Math.abs(sample.ax) + Math.abs(sample.az);

    // บันทึกจุดสูงสุดต่ำสุดที่เจอในรอบนั้น
    if (y > this.peak) this.peak = y;
    if (y < this.valley) this.valley = y;

    // --- FLEXIBLE RULE-BASED ALGORITHM ---
    
    // จังหวะที่ 1: รอให้ยกแขนขึ้น (เพิ่มเกณฑ์เป็น 3.0 เพื่อความเสถียร)
    if (this.phase === "WAIT_UP") {
      if (y > this.valley + 3.0) { 
        this.phase = "WAIT_DOWN";
        this.haptics.success(); 
      }
    } 
    // จังหวะที่ 2: รอให้ลดแขนลง
    else if (this.phase === "WAIT_DOWN") {
      if (y < this.peak - 3.0) {
        const now = Date.now();
        const repMs = now - this.lastRepTime;
        const rom = this.peak - this.valley;

        // --- ระบบกรองสัญญาณรบกวน (Deadzone Filter) ---
        // ถ้าขยับน้อยกว่า 4.5 หน่วย (เช่น ขยับแค่เซนเดียว) 
        // ให้ถือว่าเป็น Noise และเริ่มนับใหม่โดยไม่แจ้งเตือนความผิดพลาด
        if (rom < 4.5) {
          this.resetCycle(y);
          return;
        }

        let ok = true;
        let msg = "OK";

        // ตรวจสอบเงื่อนไข (ปรับให้ยืดหยุ่นขึ้น)
        if (rom < 5.5) { 
          ok = false; 
          msg = "ยกแขนไม่สุด"; 
        } else if (repMs < 600) { 
          ok = false; 
          msg = "เร็วเกินไป"; 
        } else if (side > 8.0) { 
          ok = false; 
          msg = "แขนไม่นิ่ง"; 
        }

        this.state.stats.repsTotal++;
        
        if (ok) {
          this.state.repDisplay++;
          this.state.stats.repsOk++;
          this.state.stats.score++;
          this.haptics.success();
        } else {
          this.state.stats.repsBad++;
          this.haptics.warning();
          this.tts.speak(msg);
        }

        this.state.stats.lastMessage = msg;
        this.lastRepTime = now;
        
        this.resetCycle(y);
      }
    }
  }
}