import React, { useState, useEffect } from 'react';
import { ImageIcon, Loader2, MessageSquare, Send, Bot } from 'lucide-react';
import axios from 'axios';

const IMAGE_API_URL = 'http://localhost:3001/api/generate-image';
const TEXT_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const LLM_MODELS = [
  { name: 'GPT-3.5 Turbo', id: 'gpt-3.5-turbo' },
  { name: 'GPT-4', id: 'gpt-4' },
  { name: 'Claude v1', id: 'claude-v1' },
  { name: 'Claude Instant v1', id: 'claude-instant-v1' },
  { name: 'llama-3.2-90b-text-preview', id: 'llama-3.2-90b-text-preview' },
];

export function App() {
  const [imagePrompt, setImagePrompt] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [textLoading, setTextLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [textError, setTextError] = useState('');
  const [selectedModel, setSelectedModel] = useState(LLM_MODELS[4]);

  useEffect(() => {
    console.log('App component mounted');
  }, []);

  const generateImage = async () => {
    console.log('Generating image...');
    setImageLoading(true);
    setImageError('');
    try {
      const response = await axios.post(
        IMAGE_API_URL,
        { prompt: imagePrompt },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Image generated:', response.data.imageUrl);
      setGeneratedImage(response.data.imageUrl);
    } catch (err) {
      console.error('Image generation error:', err);
      setImageError('Failed to generate image. Please try again.');
    }
    setImageLoading(false);
  };

  const generateText = async () => {
    console.log('Generating text...');
    setTextLoading(true);
    setTextError('');
    try {
      const response = await axios.post(
        TEXT_API_URL,
        {
          model: selectedModel.id,
          messages: [{ role: "user", content: textPrompt }],
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${TEXT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Text generated:', response.data.choices[0].message.content);
      setConversation([...conversation, { role: 'user', content: textPrompt }, { role: 'assistant', content: response.data.choices[0].message.content }]);
      setTextPrompt('');
    } catch (err) {
      console.error('Text generation error:', err);
      setTextError('Failed to generate text. Please try again.');
    }
    setTextLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Bot className="mr-2" />
          LLM Models
        </h2>
        <ul>
          {LLM_MODELS.map((model) => (
            <li
              key={model.id}
              className={`cursor-pointer p-2 rounded ${selectedModel.id === model.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setSelectedModel(model)}
            >
              {model.name}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">AI Playground</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ImageIcon className="mr-2" />
              Text to Image
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Enter your image prompt"
                className="w-full p-2 border rounded"
              />
              <button
                onClick={generateImage}
                disabled={imageLoading || !imagePrompt}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center"
              >
                {imageLoading ? <Loader2 className="animate-spin mr-2" /> : <ImageIcon className="mr-2" />}
                Generate Image
              </button>
              {imageError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{imageError}</p>
                </div>
              )}
              {generatedImage && (
                <div className="mt-4">
                  <img src={generatedImage} alt="Generated" className="w-full rounded-lg shadow-lg" />
                </div>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-[600px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="mr-2" />
              Chat with {selectedModel.name}
            </h2>
            <div className="flex-1 overflow-auto mb-4 space-y-4">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded"
                onKeyPress={(e) => e.key === 'Enter' && generateText()}
              />
              <button
                onClick={generateText}
                disabled={textLoading || !textPrompt}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center"
              >
                {textLoading ? <Loader2 className="animate-spin" /> : <Send />}
              </button>
            </div>
            {textError && (
              <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{textError}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;