import Head from "next/head";
import Link from "next/link";
import "../styles/globals.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>Organizador de Pedidos — pare de digitar pedido à mão</title>
        <meta
          name="description"
          content="Cole as mensagens de pedidos do WhatsApp e a IA organiza tudo em uma planilha pronta."
        />
      </Head>
      <div className="wrap">
        <div className="eyebrow">Automação para comércio local</div>
        <h1>
          Cole a conversa.
          <br />
          Saia com a planilha.
        </h1>
        <p className="lead">
          Sua loja recebe pedido por WhatsApp e alguém perde tempo copiando à mão pra
          planilha? Cole as mensagens aqui, a IA organiza produto, quantidade, cliente,
          telefone e valor automaticamente — e você exporta pra Excel com um clique.
        </p>

        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/app" className="btn">
            Já tenho acesso → abrir ferramenta
          </Link>
          {/* Troque este link pelo seu Payment Link real do Stripe (veja README.md) */}
          <a
            href="https://buy.stripe.com/SEU_PAYMENT_LINK_AQUI"
            className="btn btn-outline"
            target="_blank"
            rel="noreferrer"
          >
            Assinar agora
          </a>
        </div>

        <div className="card" style={{ marginTop: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Como funciona
          </div>
          <ol style={{ color: "#c9d6c7", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Cole as mensagens de pedidos (texto livre, do jeito que o cliente escreve).</li>
            <li>A IA separa cada pedido em produto, quantidade, cliente, telefone e valor.</li>
            <li>Revise e edite qualquer campo direto na tela.</li>
            <li>Exporte tudo para Excel com um clique.</li>
          </ol>
        </div>
      </div>
    </>
  );
}
