import { useEffect, useState } from "react";
import Head from "next/head";
import * as XLSX from "xlsx";
import "../styles/globals.css";

const SAMPLE_PLACEHOLDER = `Cole aqui as mensagens dos clientes, por exemplo:

"oi, quero 2 camisetas P azul, meu nome é João Silva, whats 11999998888"
"boa tarde! 1 tênis 42 preto pra Maria, valor combinado 180"
"3 unidades do sabonete artesanal, retirar sexta, Ana Paula"`;

function AccessGate({ onUnlock }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function verificar() {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem("op_access", "1");
        onUnlock();
      } else {
        setError("Código inválido. Confira com quem te vendeu o acesso.");
      }
    } catch (e) {
      setError("Não consegui verificar agora. Tente de novo.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="gate-box">
      <div className="eyebrow">Acesso restrito</div>
      <p style={{ color: "#c9d6c7", fontSize: 14 }}>
        Digite o código de acesso que você recebeu após a assinatura.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="CÓDIGO"
        onKeyDown={(e) => e.key === "Enter" && verificar()}
      />
      <button className="btn" onClick={verificar} disabled={checking || !code}>
        {checking ? "Verificando..." : "Entrar"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

function Field({ label, value, onChange, wide }) {
  return (
    <label style={{ gridColumn: wide ? "span 2" : "span 1" }}>
      <div className="field-label">{label}</div>
      <input
        className="field-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ReceiptRow({ order, onChange, onDelete }) {
  return (
    <div className="receipt">
      <div className="receipt-perf" />
      <div className="receipt-body">
        <div className="receipt-grid">
          <Field label="Produto" value={order.produto} onChange={(v) => onChange({ ...order, produto: v })} wide />
          <Field label="Qtd" value={order.quantidade} onChange={(v) => onChange({ ...order, quantidade: v })} />
          <Field label="Cliente" value={order.cliente} onChange={(v) => onChange({ ...order, cliente: v })} />
          <Field label="Telefone" value={order.telefone} onChange={(v) => onChange({ ...order, telefone: v })} />
          <Field label="Valor (R$)" value={order.valor} onChange={(v) => onChange({ ...order, valor: v })} />
          <Field label="Obs." value={order.obs} onChange={(v) => onChange({ ...order, obs: v })} wide />
        </div>
        <button className="remove-btn" onClick={onDelete}>
          remover
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [rawText, setRawText] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(localStorage.getItem("op_access") === "1");
      setCheckedStorage(true);
    }
  }, []);

  const total = orders.reduce((sum, o) => {
    const n = parseFloat(String(o.valor).replace(",", "."));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  async function organizarComIA() {
    if (!rawText.trim()) {
      setError("Cole pelo menos uma mensagem antes de organizar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      if (!res.ok) throw new Error("Falha na requisição");
      const parsed = await res.json();
      const withIds = parsed.map((o, i) => ({ id: Date.now() + i, ...o }));
      setOrders((prev) => [...prev, ...withIds]);
      setRawText("");
    } catch (e) {
      setError("Não consegui organizar essas mensagens. Tente novamente ou ajuste o texto.");
    } finally {
      setLoading(false);
    }
  }

  function updateOrder(id, updated) {
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }

  function deleteOrder(id) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function exportarExcel() {
    const rows = orders.map((o) => ({
      Produto: o.produto,
      Quantidade: o.quantidade,
      Cliente: o.cliente,
      Telefone: o.telefone,
      "Valor (R$)": o.valor,
      Observações: o.obs,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    XLSX.writeFile(wb, "pedidos.xlsx");
  }

  if (!checkedStorage) return null;

  if (!unlocked) {
    return (
      <>
        <Head>
          <title>Organizador de Pedidos — Acesso</title>
        </Head>
        <AccessGate onUnlock={() => setUnlocked(true)} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Organizador de Pedidos</title>
      </Head>
      <div className="wrap">
        <div className="eyebrow">Automação para comércio local</div>
        <h1 style={{ fontSize: 30 }}>Organizador de pedidos</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div className="card">
            <div className="field-label" style={{ marginBottom: 8, color: "#e3a72d" }}>
              Mensagens dos clientes
            </div>
            <textarea
              rows={10}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={SAMPLE_PLACEHOLDER}
            />
            <button
              className="btn"
              style={{ width: "100%", marginTop: 12 }}
              onClick={organizarComIA}
              disabled={loading}
            >
              {loading ? "Organizando..." : "Organizar com IA"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span className="field-label" style={{ color: "#e3a72d" }}>
                Pedidos organizados ({orders.length})
              </span>
              {orders.length > 0 && (
                <button className="btn btn-outline" style={{ padding: "6px 14px", fontSize: 13 }} onClick={exportarExcel}>
                  Exportar Excel
                </button>
              )}
            </div>

            <div style={{ maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
              {orders.length === 0 ? (
                <div className="empty-state">
                  Nenhum pedido ainda. Cole mensagens ao lado e clique em "Organizar com IA".
                </div>
              ) : (
                orders.map((o) => (
                  <ReceiptRow
                    key={o.id}
                    order={o}
                    onChange={(updated) => updateOrder(o.id, updated)}
                    onDelete={() => deleteOrder(o.id)}
                  />
                ))
              )}
            </div>

            {orders.length > 0 && (
              <div className="total-row">
                <span>Total estimado</span>
                <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
                    }
