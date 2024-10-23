import express from 'express';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const hf = new HfInference(process.env.VITE_HUGGINGFACE_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
      parameters: {
        height: 1024,
        width: 1024,
        guidance_scale: 3.5,
        num_inference_steps: 50,
      },
    });

    // Convert the blob to a base64 string
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    res.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});