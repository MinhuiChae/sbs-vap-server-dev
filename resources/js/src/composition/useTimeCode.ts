

class TimeCode {
  frameRate: number = 30;
  drop: boolean = false;
  frame: number = 0;
  seconds: number = 0;
  minutes: number = 0;
  hours: number = 0;
  tc: string = '';

  constructor(frameRate?: number, drop?: boolean) {
    if (frameRate) this.frameRate = frameRate;
    if (drop === false) this.drop = false;
  }

  setFrameRate(frameRate: number): void {
    this.frameRate = frameRate;
  }

  setDrop(drop: boolean): void {
    this.drop = drop;
  }

  getFrameByTimeCode(tc?: string): number {
    const hour = this.hours;
    const minutes = this.minutes;
    const seconds = this.seconds;
    const frameRate = this.frameRate;
    const frame = this.frame;

    let frameCount: number = 0;
    let totalMinutes: number;
    let dropframe: number;

    if(tc) {
      this.parseTc(tc);
    }

    frameCount = (hour * 3600 + minutes*60 + seconds) * Math.round(frameRate) + frame;

    if(this.drop) {
      totalMinutes = hour * 60 + minutes;
      dropframe = this.getDropFrame();
      frameCount = frameCount - dropframe * (totalMinutes - Math.floor(totalMinutes / 10));
    }

    return frameCount;
  }

  getTimeCodeByFrame(frame: number): string {
    const fps: number = Math.round(this.frameRate);
    let dropframe: number = 2,
        drop: number,
        mdrop: number;

    if (frame !==0 && this.drop === true) {
      dropframe = this.getDropFrame();
      drop = Math.floor(frame / (17982 * (dropframe / 2)));
      mdrop = frame % (17982 * dropframe / 2);
      if(mdrop < dropframe) mdrop = mdrop + dropframe;
      frame = frame + (9 * dropframe * drop) + dropframe * (Math.floor((mdrop-dropframe)/(1798 * dropframe/2)));
    }

    this.frame = frame % fps;
    this.seconds = Math.floor(frame/fps) % 60;
    this.minutes = Math.floor(frame/(fps * 60)) % 60;
    this.hours = Math.floor(frame/(fps * 3600)) % 24;

    return this.toString();
  }

  private getDropFrame(): number {
    if(this.frameRate === 29.97 || this.frameRate === 59.94){
      return this.frameRate === 29.97 ? 2 : 4;
    }
    return 0;
  }

  private toString() {
    const frames = this.frame,
          field: string = "";

    return "".concat(
      this.hours<10 ? '0' : '',
      this.hours.toString(),
      ':',
      this.minutes<10 ? '0' : '',
      this.minutes.toString(),
      ':',
      this.seconds<10 ? '0' : '',
      this.seconds.toString(),
      this.drop ? ';' : ':',
      frames < 10 ? '0' : '',
      frames.toString(),
      field
    );
  }

  private parseTc(timeCode: string) {
    const parts = timeCode.match("^([012]\\d):(\\d\\d):(\\d\\d)(:|;|\\.)(\\d\\d)$");
    if (!parts) throw new Error("Timecode string expected as HH:MM:SS:FF or HH:MM:SS;FF");
    this.hours = parseInt(parts[1]);
    this.minutes = parseInt(parts[2]);
    this.seconds = parseInt(parts[3]);
    this.drop = parts[4] !== ':';
    this.frame = parseInt(parts[5]);
  }
}

export default TimeCode;
