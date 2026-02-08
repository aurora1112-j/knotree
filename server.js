import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MODELSCOPE_API_KEY = process.env.MODELSCOPE_API_KEY;
const MODELSCOPE_MODEL =
  process.env.MODELSCOPE_MODEL || "stepfun-ai/Step-3.5-Flash";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// ─── ModelScope (OpenAI-compatible) API Proxy ───
app.post("/api/llm", async (req, res) => {
  try {
    if (!MODELSCOPE_API_KEY) {
      return res
        .status(500)
        .json({ error: "MODELSCOPE_API_KEY not set in .env" });
    }

    const { messages, temperature = 0.7, max_tokens = 1024 } = req.body;

    const response = await fetch(
      "https://api-inference.modelscope.cn/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MODELSCOPE_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODELSCOPE_MODEL,
          messages,
          temperature,
          max_tokens,
          stream: false,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("ModelScope API error:", data.error);
      return res
        .status(500)
        .json({ error: data.error.message || "ModelScope API error" });
    }

    // 提取文本内容，返回统一格式
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (err) {
    console.error("ModelScope API error:", err);
    res.status(500).json({ error: "ModelScope API request failed" });
  }
});

// ─── Tavily API Proxy ───
app.post("/api/tavily", async (req, res) => {
  try {
    if (!TAVILY_API_KEY) {
      return res
        .status(500)
        .json({ error: "TAVILY_API_KEY not set in .env" });
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        ...req.body,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Tavily API error:", err);
    res.status(500).json({ error: "Tavily API request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ KnoTree API proxy running on http://localhost:${PORT}`);
  console.log(
    `   ModelScope API: ${MODELSCOPE_API_KEY ? "✅ configured" : "❌ missing"}`
  );
  console.log(`   Model:          ${MODELSCOPE_MODEL}`);
  console.log(
    `   Tavily API:     ${TAVILY_API_KEY ? "✅ configured" : "❌ missing"}`
  );
});
