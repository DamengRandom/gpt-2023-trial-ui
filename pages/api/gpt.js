import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_URL,
});

const OAModel = "text-davinci-003";
const OAMaxTokens = 200; // set dynamically

export default async function handler(req, res) {
  try {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: OAModel,
      prompt: req.query.words,
      temperature: 0.9,
      max_tokens: OAMaxTokens,
    });

    if (response) {
      const result = response?.data;

      return res.status(200).json({ data: result });
    }

    return res.status(400).json({ data: "Bad request ..." });
  } catch (error) {
    return res.status(500).json(error);
  }
}
