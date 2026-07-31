export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Texto vazio" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Você organiza pedidos de clientes de um comércio local a partir de mensagens de WhatsApp em texto livre.

Extraia cada pedido separado do texto abaixo e retorne APENAS um array JSON (sem markdown, sem texto extra), no formato:
[{"produto":"","quantidade":"","cliente":"","telefone":"","valor":"","obs":""}]

Regras:
- "quantidade" só o número (ex: "2"), vazio se não mencionado.
- "valor" só o número (ex: "180"), vazio se não mencionado.
- "obs" para detalhes extras (cor, tamanho, prazo de retirada etc).
- Se um campo não aparecer na mensagem, deixe a string vazia "".
- Cada mensagem distinta vira um item do array, mesmo que peça mais de um pedido.

Texto:
"""${text}"""`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da API Anthropic:", data);
      return res.status(502).json({ error: "Erro ao chamar a IA" });
    }

    const rawText = data.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno" });
  }
}
