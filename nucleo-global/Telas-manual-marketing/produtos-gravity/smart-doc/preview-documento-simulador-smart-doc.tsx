import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  calcularTotalInvoice,
  formatarMoeda,
  formatarPeso,
  gerarItensBolSimulador,
  gerarItensInvoiceSimulador,
  gerarItensPackingSimulador,
} from './documentos-preview-simulador-smart-doc'

type Props = {
  documento: DocumentoSimulador
  nomeArquivo: string
}

function CabecalhoCampo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="sds-nl-prev-campo">
      <span className="sds-nl-prev-campo-rotulo">{rotulo}</span>
      <span className="sds-nl-prev-campo-valor">{valor}</span>
    </div>
  )
}

function PreviewInvoice({ documento }: { documento: DocumentoSimulador }) {
  const itens = gerarItensInvoiceSimulador(documento.quantidadeItens)
  const total = calcularTotalInvoice(itens)

  return (
    <article className="sds-nl-prev-pagina">
      <header className="sds-nl-prev-pagina-topo">
        <div>
          <p className="sds-nl-prev-pagina-empresa">EXPORTADOR GLOBAL MACHINERY GMBH</p>
          <p className="sds-nl-prev-pagina-endereco">Hafenstraße 42 — 20457 Hamburg, Germany</p>
        </div>
        <div className="sds-nl-prev-pagina-titulo-doc">
          <strong>COMMERCIAL INVOICE</strong>
          <span>{documento.rotulo}</span>
        </div>
      </header>

      <div className="sds-nl-prev-campos-grid">
        <CabecalhoCampo rotulo="Consignee" valor="IMPORTADORA GLOBAL LTDA" />
        <CabecalhoCampo rotulo="Invoice Date" valor="18/06/2026" />
        <CabecalhoCampo rotulo="PO Reference" valor="PO-9821" />
        <CabecalhoCampo rotulo="Incoterm" valor="FOB Hamburg" />
        <CabecalhoCampo rotulo="Currency" valor="USD" />
        <CabecalhoCampo rotulo="Payment Terms" valor="30 days net" />
      </div>

      <div className="sds-nl-prev-tabela-wrap">
        <table className="sds-nl-prev-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Part No.</th>
              <th>Description</th>
              <th>NCM</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.linha}>
                <td>{item.linha}</td>
                <td>{item.partNumber}</td>
                <td>{item.descricao}</td>
                <td>{item.ncm}</td>
                <td>{item.quantidade}</td>
                <td>{item.unidade}</td>
                <td>USD {formatarMoeda(item.precoUnitario)}</td>
                <td>USD {formatarMoeda(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="sds-nl-prev-rodape-doc">
        <span>{documento.quantidadeItens} itens</span>
        <strong>Total USD {formatarMoeda(total)}</strong>
      </footer>
    </article>
  )
}

function PreviewPackingList({ documento }: { documento: DocumentoSimulador }) {
  const itens = gerarItensPackingSimulador(documento.quantidadeItens)
  const pesoLiquido = itens.reduce((acc, item) => acc + item.pesoLiquidoKg, 0)
  const pesoBruto = itens.reduce((acc, item) => acc + item.pesoBrutoKg, 0)

  return (
    <article className="sds-nl-prev-pagina">
      <header className="sds-nl-prev-pagina-topo">
        <div>
          <p className="sds-nl-prev-pagina-empresa">EXPORTADOR GLOBAL MACHINERY GMBH</p>
          <p className="sds-nl-prev-pagina-endereco">Shipment PO-9821 — Hamburg → Santos</p>
        </div>
        <div className="sds-nl-prev-pagina-titulo-doc">
          <strong>PACKING LIST</strong>
          <span>{documento.rotulo}</span>
        </div>
      </header>

      <div className="sds-nl-prev-campos-grid">
        <CabecalhoCampo rotulo="Shipper" valor="EXPORTADOR GLOBAL MACHINERY GMBH" />
        <CabecalhoCampo rotulo="Consignee" valor="IMPORTADORA GLOBAL LTDA" />
        <CabecalhoCampo rotulo="Invoice Ref." valor="INV-9821" />
        <CabecalhoCampo rotulo="Total Packages" valor={`${documento.quantidadeItens} linhas`} />
      </div>

      <div className="sds-nl-prev-tabela-wrap">
        <table className="sds-nl-prev-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Part No.</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Cartons</th>
              <th>Net Weight (kg)</th>
              <th>Gross Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.linha}>
                <td>{item.linha}</td>
                <td>{item.partNumber}</td>
                <td>{item.descricao}</td>
                <td>{item.quantidade}</td>
                <td>{item.caixas}</td>
                <td>{formatarPeso(item.pesoLiquidoKg)}</td>
                <td>{formatarPeso(item.pesoBrutoKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="sds-nl-prev-rodape-doc">
        <span>{documento.quantidadeItens} itens</span>
        <strong>
          Net {formatarPeso(pesoLiquido)} kg · Gross {formatarPeso(pesoBruto)} kg
        </strong>
      </footer>
    </article>
  )
}

function PreviewBillOfLading({ documento }: { documento: DocumentoSimulador }) {
  const itens = gerarItensBolSimulador(documento.quantidadeItens)

  return (
    <article className="sds-nl-prev-pagina">
      <header className="sds-nl-prev-pagina-topo">
        <div>
          <p className="sds-nl-prev-pagina-empresa">OCEAN CARRIER LOGISTICS</p>
          <p className="sds-nl-prev-pagina-endereco">B/L HBL4492 — Vessel MSC BRASILIA VII</p>
        </div>
        <div className="sds-nl-prev-pagina-titulo-doc">
          <strong>BILL OF LADING</strong>
          <span>{documento.rotulo}</span>
        </div>
      </header>

      <div className="sds-nl-prev-campos-grid">
        <CabecalhoCampo rotulo="Shipper" valor="EXPORTADOR GLOBAL MACHINERY GMBH" />
        <CabecalhoCampo rotulo="Consignee" valor="IMPORTADORA GLOBAL LTDA" />
        <CabecalhoCampo rotulo="Port of Loading" valor="Hamburg, DE" />
        <CabecalhoCampo rotulo="Port of Discharge" valor="Santos, BR" />
        <CabecalhoCampo rotulo="Vessel / Voyage" valor="MSC BRASILIA VII / 026E" />
        <CabecalhoCampo rotulo="Freight Terms" valor="FREIGHT PREPAID" />
      </div>

      <div className="sds-nl-prev-tabela-wrap">
        <table className="sds-nl-prev-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Container</th>
              <th>Seal</th>
              <th>Type</th>
              <th>Packages</th>
              <th>Weight (kg)</th>
              <th>Measurement</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.linha}>
                <td>{item.linha}</td>
                <td>{item.container}</td>
                <td>{item.selo}</td>
                <td>{item.tipo}</td>
                <td>{item.volumes}</td>
                <td>{formatarPeso(item.pesoKg)}</td>
                <td>{item.medida}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="sds-nl-prev-rodape-doc">
        <span>{documento.quantidadeItens} containers / lotes</span>
        <strong>Place of delivery: Santos — Brazil</strong>
      </footer>
    </article>
  )
}

export function PreviewDocumentoSimuladorSmartDoc({ documento, nomeArquivo }: Props) {
  return (
    <div className="sds-nl-prev-documento">
      <p className="sds-nl-prev-documento-arquivo" title={nomeArquivo}>
        Arquivo: {nomeArquivo}
      </p>
      {documento.tipo === 'invoice' && <PreviewInvoice documento={documento} />}
      {documento.tipo === 'packing-list' && <PreviewPackingList documento={documento} />}
      {documento.tipo === 'bill-of-lading' && <PreviewBillOfLading documento={documento} />}
    </div>
  )
}
