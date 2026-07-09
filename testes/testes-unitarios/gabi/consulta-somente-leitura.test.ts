// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { validarSelectSomenteLeitura } from '../../../servicos-global/servicos-plataforma/gabi/server/lib/consulta-somente-leitura.js'

describe('validarSelectSomenteLeitura — aceita leitura', () => {
  it('aceita SELECT simples', () => {
    expect(validarSelectSomenteLeitura('SELECT 1')).toBe('SELECT 1')
  })

  it('aceita SELECT com WHERE/JOIN', () => {
    const sql = 'SELECT p.numero_pedido FROM gabi_conversa c JOIN gabi_mensagem m ON m.id_conversa_gabi_mensagem = c.id_gabi_conversa'
    expect(validarSelectSomenteLeitura(sql)).toBe(sql)
  })

  it('aceita CTE (WITH ... SELECT)', () => {
    const sql = 'WITH recentes AS (SELECT * FROM gabi_log_uso) SELECT count(*) FROM recentes'
    expect(validarSelectSomenteLeitura(sql)).toBe(sql)
  })

  it('remove ponto-e-virgula final e espacos', () => {
    expect(validarSelectSomenteLeitura('  SELECT 1 ;  ')).toBe('SELECT 1')
  })

  it('aceita introspecao via information_schema', () => {
    const sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()"
    expect(validarSelectSomenteLeitura(sql)).toBe(sql)
  })
})

describe('validarSelectSomenteLeitura — rejeita escrita e ataques', () => {
  const casos: Array<[string, string]> = [
    ['vazio', ''],
    ['so espacos', '   '],
    ['INSERT', "INSERT INTO gabi_log_uso (id) VALUES ('x')"],
    ['UPDATE', 'UPDATE gabi_conversa SET titulo_gabi_conversa = null'],
    ['DELETE', 'DELETE FROM gabi_conversa'],
    ['DROP', 'DROP TABLE gabi_conversa'],
    ['ALTER', 'ALTER TABLE gabi_conversa ADD COLUMN x int'],
    ['TRUNCATE', 'TRUNCATE gabi_log_uso'],
    ['CREATE', 'CREATE TABLE x (id int)'],
    ['statements empilhados', 'SELECT 1; DROP TABLE gabi_conversa'],
    ['CTE com escrita (writable CTE)', 'WITH x AS (DELETE FROM gabi_conversa RETURNING *) SELECT * FROM x'],
    ['SELECT INTO (cria tabela)', 'SELECT * INTO nova_tabela FROM gabi_conversa'],
    ['nao comeca com SELECT/WITH', 'EXPLAIN SELECT 1'],
    ['SET de sessao', 'SET search_path TO public'],
    ['funcao perigosa pg_sleep', 'SELECT pg_sleep(10)'],
    ['leitura de arquivo', "SELECT pg_read_file('/etc/passwd')"],
    ['statements empilhados escondidos apos comentario de bloco', 'SELECT 1 /* comentario */ ; DROP TABLE gabi_conversa'],
  ]

  for (const [nome, sql] of casos) {
    it(`rejeita: ${nome}`, () => {
      expect(() => validarSelectSomenteLeitura(sql)).toThrow()
    })
  }

  it('neutraliza escrita escondida em comentario de linha (remove comentario, sobra SELECT seguro)', () => {
    expect(validarSelectSomenteLeitura('SELECT 1 -- ; DROP TABLE gabi_conversa')).toBe('SELECT 1')
  })

  it('neutraliza escrita escondida em comentario de bloco (remove comentario, sobra SELECT seguro)', () => {
    expect(validarSelectSomenteLeitura('SELECT 1 /* ; DROP TABLE gabi_conversa */')).toBe('SELECT 1')
  })

  it('comentario que esconde DELETE nao vira consulta valida com escrita', () => {
    // O comentario e removido; sobra "SELECT 1" — valido e sem escrita.
    expect(validarSelectSomenteLeitura('SELECT 1 -- DELETE FROM gabi_conversa')).toBe('SELECT 1')
  })
})
