interface QRiousStatic {
  // eslint-disable-next-line @typescript-eslint/no-misused-new,no-use-before-define
  new (options?: QRiousOptions): QRiousStatic;
  toDataURL(mime?: string): string;
}

type CorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRiousOptions {
  background?: string;
  backgroundAlpha?: number;
  foreground?: string;
  foregroundAlpha?: number;
  level?: CorrectionLevel;
  padding?: number;
  size?: number;
  value?: string;
}

declare module 'qrious' {
  // eslint-disable-next-line no-use-before-define
  export = QRious;
}

declare let QRious: QRiousStatic
