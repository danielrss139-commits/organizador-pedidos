export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Texto vazio" });
  }

  try {
    const prompt = `Você organiza pedidos de clientes de um comércio local a partir de mensagens de WhatsApp em texto livre.

Extraia cada pedido separado do texto abaixo e retorne APENAS um array JSON (sem markdown, sem texto extra), no formato:
[{"produto":"","quantidade":"","cliente":"","telefone":"","valor":"","obs":""}]

Regras:
- "quantidade" só o número (ex: "2"), vazio se não mencionado.
- "valor" só o número (ex: "180"), vazio se não mencionado.
- "obs" para detalhes extras (cor, tamanho, prazo de retirada etc).
- Se um campo não aparecer na mensagem, deixe a string vazia "".
- Cada mensagem distinta vira um item do array, mesmo que peça mais de um pedido.

Texto:
"""${text}"""`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da API Gemini:", data);
      return res.status(502).json({ error: "Erro ao chamar a IA" });
    }

    const rawText = data.candidates[0].content.parts[0].text.trim();
    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno" });
  }
}
