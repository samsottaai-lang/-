import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const OFFICIAL_DOC_PROMPT = `
당신은 대한민국 공공기관의 공문서 작성 전문가입니다. 
사용자가 입력한 내용을 '행정 효율과 협업 촉진에 관한 규정' 및 '공공기관 공문서 작성법' 표준에 맞춰 변환하세요.

[작성 원칙]
1. 문장은 간결하고 명확하게 작성한다. (~함, ~임 등 명사형 종결 어미 선호)
2. 불필요한 수식어나 감정적 표현은 배제한다.
3. 전문 용어나 어려운 한자어는 쉬운 우리말로 순화한다 (예: '익일' -> '다음 날', '금번' -> '이번').
4. 날짜와 시간 표기법을 준수한다 (예: 2024. 3. 25. 14:00).
5. 항목 구분은 표준 체계를 따른다 (1., 가., 1), 가), (1), (가)).
6. 수신자에게 정중하면서도 공적인 어조를 유지한다.

입력된 내용을 바탕으로 제목과 본문(개요, 목적, 세부내용, 협조사항 등)이 포함된 표준 공문서 형식으로 재구성하세요.
결과는 마크다운 형식을 사용하여 가독성 있게 출력하세요.
`;

export async function convertToOfficialDoc(text: string) {
  if (!text.trim()) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: OFFICIAL_DOC_PROMPT,
      },
    });
    return response.text || "변환에 실패했습니다.";
  } catch (error) {
    console.error("Conversion error:", error);
    return "오류가 발생했습니다. 다시 시도해주세요.";
  }
}
