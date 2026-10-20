const UTF8_BOM = [0xef, 0xbb, 0xbf]

/**
 * Turns the file's bytes into text: UTF-8 when they are valid UTF-8, else Windows-1252 (many Brazilian banks still
 * export in it). The OFX `CHARSET`/`ENCODING` header isn't trusted: Banco Inter writes `CHARSET:1252` over UTF-8 bytes.
 * Real Windows-1252 text with accents is practically never valid UTF-8, so the bytes decide.
 */
export function decodeStatementFile(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  if (UTF8_BOM.every((byte, index) => bytes[index] === byte)) {
    return new TextDecoder('utf-8').decode(bytes.subarray(UTF8_BOM.length))
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}
