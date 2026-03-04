import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export interface AudioRecorder {
  start(): Promise<void>;
  stop(): Promise<ArrayBuffer>;
  isRecording(): boolean;
}

export interface RecorderOptions {
  sampleRate?: number;
  channels?: number;
  format?: string;
}

export class WindowsRecorder implements AudioRecorder {
  private recording = false;
  private tempFile: string | null = null;
  private process: ChildProcess | null = null;

  async start(options?: RecorderOptions): Promise<void> {
    if (this.recording) return;

    const timestamp = Date.now();
    this.tempFile = join(tmpdir(), `voice-opencode-rec-${timestamp}.wav`);
    this.recording = true;

    const script = `
Add-Type -AssemblyName System.Speech

$recording = $true
$outputPath = '${this.tempFile.replace(/\\/g, '\\\\')}'

# Create a simple WAV header approach using .NET
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Runtime.InteropServices;

public class AudioRecorder {
    [DllImport("winmm.dll", SetLastError = true)]
    public static extern int mciSendString(string lpstrCommand, string lpstrReturnString, int uReturnLength, IntPtr hwndCallback);
    
    public static void StartRecording(string path) {
        mciSendString($"open new type waveaudio alias sound", null, 0, IntPtr.Zero);
        mciSendString($"record sound", null, 0, IntPtr.Zero);
    }
    
    public static void StopRecording(string path) {
        mciSendString($"save sound {path}", null, 0, IntPtr.Zero);
        mciSendString($"close sound", null, 0, IntPtr.Zero);
    }
}
'@

[AudioRecorder]::StartRecording($outputPath)

# Save process info for stopping
$script:recorderProcess = Get-Process -Id $PID
$script:outputPath = $outputPath

Write-Output "RECORDING_STARTED:$outputPath"
while ($script:recorderProcess -and -not $script:recorderProcess.HasExited) {
    Start-Sleep -Milliseconds 100
}
`;

    return new Promise((resolve, reject) => {
      const proc = spawn('powershell', ['-NoProfile', '-Command', '-'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('RECORDING_STARTED')) {
          console.log('[Audio] Recording started');
          resolve();
        }
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0 && !this.recording) {
          console.log('[Audio] Recording process ended');
        }
      });

      proc.on('error', (err) => {
        console.error('[Audio] Recording error:', err);
        reject(err);
      });

      proc.stdin.write(script);
      proc.stdin.end();
    });
  }

  async stop(): Promise<ArrayBuffer> {
    if (!this.recording || !this.tempFile) {
      throw new Error('Not recording');
    }

    this.recording = false;

    // Stop recording and save file
    const stopScript = `
[AudioRecorder]::StopRecording('${this.tempFile.replace(/\\/g, '\\\\')}')
Write-Output "RECORDING_STOPPED"
`;

    return new Promise((resolve, reject) => {
      const proc = spawn('powershell', ['-NoProfile', '-Command', stopScript]);

      proc.on('close', async (code) => {
        try {
          if (this.tempFile) {
            const data = await Bun.file(this.tempFile).arrayBuffer();
            await unlink(this.tempFile).catch(() => {});
            this.tempFile = null;
            console.log('[Audio] Recording stopped');
            resolve(data);
          } else {
            resolve(new ArrayBuffer(0));
          }
        } catch (err) {
          reject(err);
        }
      });

      proc.on('error', reject);
    });
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export class MacRecorder implements AudioRecorder {
  private recording = false;
  private tempFile: string | null = null;
  private process: ChildProcess | null = null;

  async start(): Promise<void> {
    if (this.recording) return;

    this.tempFile = join(tmpdir(), `voice-opencode-rec-${Date.now()}.wav`);
    this.recording = true;

    // Use sox if available, otherwise use rec from ImageMagick
    this.process = spawn('sox', ['-d', '-r', '16000', '-c', '1', this.tempFile]);

    console.log('[Audio] Recording started (macOS)');
  }

  async stop(): Promise<ArrayBuffer> {
    if (!this.recording) {
      throw new Error('Not recording');
    }

    this.recording = false;

    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    try {
      const data = await Bun.file(this.tempFile!).arrayBuffer();
      await unlink(this.tempFile!).catch(() => {});
      this.tempFile = null;
      console.log('[Audio] Recording stopped');
      return data;
    } catch {
      return new ArrayBuffer(0);
    }
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export class LinuxRecorder implements AudioRecorder {
  private recording = false;
  private tempFile: string | null = null;
  private process: ChildProcess | null = null;

  async start(): Promise<void> {
    if (this.recording) return;

    this.tempFile = join(tmpdir(), `voice-opencode-rec-${Date.now()}.wav`);
    this.recording = true;

    // Use arecord (ALSA) or parec (PulseAudio)
    this.process = spawn('arecord', ['-f', 'cd', '-r', '16000', '-c', '1', '-t', 'wav', this.tempFile]);

    console.log('[Audio] Recording started (Linux)');
  }

  async stop(): Promise<ArrayBuffer> {
    if (!this.recording) {
      throw new Error('Not recording');
    }

    this.recording = false;

    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    try {
      const data = await Bun.file(this.tempFile!).arrayBuffer();
      await unlink(this.tempFile!).catch(() => {});
      this.tempFile = null;
      console.log('[Audio] Recording stopped');
      return data;
    } catch {
      return new ArrayBuffer(0);
    }
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export function createMicrophone(options?: RecorderOptions): AudioRecorder {
  const platform = process.platform;
  
  switch (platform) {
    case 'win32':
      return new WindowsRecorder();
    case 'darwin':
      return new MacRecorder();
    case 'linux':
      return new LinuxRecorder();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
