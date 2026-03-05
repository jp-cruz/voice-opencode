import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export interface AudioPlayer {
  play(buffer: ArrayBuffer): Promise<void>;
  stop(): void;
  isPlaying(): boolean;
}

export class CrossPlatformPlayer implements AudioPlayer {
  private playing = false;

  async play(buffer: ArrayBuffer): Promise<void> {
    this.playing = true;
    const tempFile = join(tmpdir(), `voice-opencode-play-${Date.now()}.mp3`);
    
    try {
      await writeFile(tempFile, Buffer.from(buffer));
      
      await this.playFile(tempFile);
    } finally {
      this.playing = false;
      await unlink(tempFile).catch(() => {});
    }
  }

  private playFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const platform = process.platform;
      let proc: ChildProcess;

      if (platform === 'win32') {
        proc = spawn('powershell', [
          '-Command',
          `(New-Object System.Media.SoundPlayer '${filePath}').PlaySync()`
        ]);
      } else if (platform === 'darwin') {
        proc = spawn('afplay', [filePath]);
      } else {
        proc = spawn('play', [filePath]);
      }

      proc.on('close', (code) => {
        if (code === 0 || code === null) {
          resolve();
        } else {
          reject(new Error(`Playback failed with code ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }

  stop(): void {
    this.playing = false;
  }

  isPlaying(): boolean {
    return this.playing;
  }
}

export function createAudioPlayer(): AudioPlayer {
  return new CrossPlatformPlayer();
}
