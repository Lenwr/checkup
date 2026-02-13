import QRCode from "qrcode";

export async function toQrDataUrl(text: string) {
  return QRCode.toDataURL(text, { margin: 1, width: 320 });
}
