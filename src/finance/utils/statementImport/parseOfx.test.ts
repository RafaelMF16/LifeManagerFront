import { describe, expect, it } from 'vitest'
import { parseOfx } from './parseOfx'
import { StatementFileError } from './statementLines'

const SGML_OFX = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252

<OFX>
<SIGNONMSGSRSV1><SONRS><STATUS><CODE>0<SEVERITY>INFO</STATUS><DTSERVER>20240331120000[-3:BRT]<LANGUAGE>POR</SONRS></SIGNONMSGSRSV1>
<BANKMSGSRSV1><STMTTRNRS><TRNUID>1<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<STMTRS><CURDEF>BRL
<BANKACCTFROM>
<BANKID>0260
<ACCTID>12345-6
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240301
<DTEND>20240331
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240305000000[-3:BRT]
<TRNAMT>-42.90
<FITID>abc-1
<MEMO>Compra no débito - IFOOD *RESTAURANTE
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240310
<TRNAMT>5000,00
<FITID>abc-2
<NAME>EMPRESA XPTO
<MEMO>SALARIO
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240231
<TRNAMT>-1.00
<FITID>abc-3
<MEMO>Data inválida
</STMTTRN>
</BANKTRANLIST>
</STMTRS></STMTTRNRS></BANKMSGSRSV1>
</OFX>`

const XML_OFX = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<?OFX OFXHEADER="200" VERSION="220" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>
<OFX>
  <CREDITCARDMSGSRSV1><CCSTMTTRNRS><CCSTMTRS>
    <CCACCTFROM><ACCTID>9999</ACCTID></CCACCTFROM>
    <BANKTRANLIST>
      <STMTTRN>
        <TRNTYPE>DEBIT</TRNTYPE>
        <DTPOSTED>20240115</DTPOSTED>
        <TRNAMT>-89.90</TRNAMT>
        <FITID>xyz</FITID>
        <NAME>PADARIA &amp; CAFE</NAME>
        <MEMO>PADARIA</MEMO>
      </STMTTRN>
    </BANKTRANLIST>
  </CCSTMTRS></CCSTMTTRNRS></CREDITCARDMSGSRSV1>
</OFX>`

describe('parseOfx', () => {
  it('reads an OFX 1.x (SGML) bank statement', () => {
    const statement = parseOfx(SGML_OFX)

    expect(statement.accountId).toBe('0260:12345-6')
    expect(statement.lines).toEqual([
      { date: '2024-03-05', description: 'Compra no débito - IFOOD *RESTAURANTE', amount: -42.9, fitid: 'abc-1' },
      { date: '2024-03-10', description: 'EMPRESA XPTO - SALARIO', amount: 5000, fitid: 'abc-2' },
    ])
  })

  it('reads an OFX 2.x (XML) credit card statement', () => {
    const statement = parseOfx(XML_OFX)

    expect(statement.accountId).toBe('9999')
    expect(statement.lines).toEqual([{ date: '2024-01-15', description: 'PADARIA & CAFE', amount: -89.9, fitid: 'xyz' }])
  })

  it('fails when the text is not OFX', () => {
    expect(() => parseOfx('Data;Valor\n01/01/2024;10')).toThrow(StatementFileError)
  })

  it('fails when there are no readable transactions', () => {
    expect(() => parseOfx('<OFX><BANKTRANLIST></BANKTRANLIST></OFX>')).toThrow(
      expect.objectContaining({ reason: 'noTransactions' }),
    )
  })
})
