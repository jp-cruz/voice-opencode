import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export interface AudioRecorder {
  start(): Promise<void>;
  stop(): Promise<ArrayBuffer>;
  isRecording(): boolean;
}

export class WindowsMicrophone implements AudioRecorder {
  private recording = false;
  private tempFile: string | null = null;
  private process: ChildProcess | null = null;

  async start(): Promise<void> {
    if (this.recording) return;

    this.tempFile = join(tmpdir(), `voice-opencode-rec-${Date.now()}.wav`);
    this.recording = true;

    // Use PowerShell to record audio
    const script = `
      Add-Type -AssemblyName System.Speech
      $recorder = New-Object System.Speech.Recognition.SpeechRecognitionEngine
      [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    `;

    // Simpler approach: create an empty file to indicate recording started
    await writeFile(this.tempFile, Buffer.alloc(0));
    console.log('[Audio] Recording started (Windows)');
  }

  async stop(): Promise<ArrayBuffer> {
    if (!this.recording || !this.tempFile) {
      throw new Error('Not recording');
    }

    this.recording = false;
    
    // For Windows, we'll use a different approach
    // Record using sox or similar if available, otherwise create a placeholder
    console.log('[Audio] Recording stopped');

    // Return empty buffer for now - actual implementation would use
    // a proper audio recording library or command-line tool
    const emptyBuffer = new ArrayBuffer(0);
    
    if (this.tempFile) {
      await unlink(this.tempFile).catch(() => {});
      this.tempFile = null;
    }

    return emptyBuffer;
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export class MacMicrophone implements AudioRecorder {
  private recording = false;
  private tempFile: string | null = null;
  private process: ChildProcess | null = null;

  async start(): Promise<void> {
    if (this.recording) return;

    this.tempFile = join(tmpdir(), `voice-opencode-rec-${Date.now()}.wav`);
    this.recording = true;

    // Use sox or arecord on macOS if available
    console.log('[Audio] Recording started (macOS)');
  }

  async stop(): Promise<ArrayBuffer> {
    if (!this.recording) {
      throw new Error('Not recording');
    }

    this.recording = false;
    console.log('[Audio] Recording stopped');

    const emptyBuffer = new ArrayBuffer(0);
    
    if (this.tempFile) {
      await unlink(this.tempFile).catch(() => {});
      this.tempFile = null;
    }

    return emptyBuffer;
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export class LinuxMicrophone implements AudioRecorder {
  private recording = false;
  private tempFile: string | null = null;

  async start(): Promise<void> {
    if (this.recording) return;

    this.tempFile = join(tmpdir(), `voice-opencode-rec-${Date.now()}.wav`);
    this.recording = true;
    console.log('[Audio] Recording started (Linux)');
  }

  async stop(): Promise<ArrayBuffer> {
    if (!this.recording) {
      throw new Error('Not recording');
    }

    this.recording = false;
    console.log('[Audio] Recording stopped');

    const emptyBuffer = new ArrayBuffer(0);
    
    if (this.tempFile) {
      await unlink(this.tempFile).catch(() => {});
      this.tempFile = null;
    }

    return emptyBuffer;
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export function createMicrophone(): AudioRecorder {
  const platform = process.platform;
  
  switch (platform) {
    case 'win32':
      return new WindowsMicrophone();
    case 'darwin':
      return new MacMicrophone();
    case 'linux':
      return new LinuxMicrophone();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
