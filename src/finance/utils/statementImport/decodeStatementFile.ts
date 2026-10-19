const UTF8_BOM = [0xef, 0xbb, 0xbf]

/**
 * Turns the file's bytes into text. Brazilian banks still export many statements in Windows-1252 (OFX 1.x says so in
 * its `CHARSET:1252` header): the header wins when it names the charset; otherwise the bytes are read as UTF-8 and,
 * if they aren't valid UTF-8, as Windows-1252.
 */
export function decodeStatementFile(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  if (UTF8_BOM.every((byte, index) => bytes[index] === byte)) {
    return new TextDecoder('utf-8').decode(bytes.subarray(UTF8_BOM.length))
  }

  const head = new TextDecoder('windows-1252').decode(bytes.subarray(0, 1024)).toUpperCase()
  if (/CHARSET:\s*(1252|ISO-8859-1|8859-1)/.test(head)) return new TextDecoder('windows-1252').decode(bytes)
  if (/ENCODING:\s*UTF-?8|ENCODING="UTF-?8"|CHARSET:\s*UTF-?8/.test(head)) return new TextDecoder('utf-8').decode(bytes)

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}
