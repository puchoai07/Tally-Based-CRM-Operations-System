import React, { useState } from 'react';
import Papa from 'papaparse';
import { ChatInterface } from '../components/chat/ChatInterface';
import { mapSheetRowToResearch } from '../lib/deepDiveUtils';

export function DeepDiveChat() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (topic) => {
        // 1. Add User Message
        const userMsg = { type: 'user', content: topic };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        // 2. Generate Log ID
        const logId = Array.from({ length: 10 }, () =>
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62))
        ).join('');

        try {
            // CONSTANTS
            // CONSTANTS
            const WEBHOOK_URL = "https://studio.pucho.ai/api/v1/webhooks/oDRVr7DBDJLePY448EK9W/sync";
            const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1gJi9dlMg0h9Ri4dZEK8EbvrbeO2b1dp3Gh7vCccN8X4/gviz/tq?tqx=out:csv";

            console.log("Starting Deep Dive Research on:", topic);
            console.log("Log ID:", logId);

            // 3. Fire Webhook and Wait for Response (Sync)
            // The request can take up to 3 minutes, so we await the response.
            let textResponse;
            if (topic.toLowerCase() === 'test html') {
                textResponse = JSON.stringify({
                    status: 200,
                    body: {
                        output: "```html\n<b>Hello! 👋</b><br><br>\nI am <b>Pucho's Tally Chatbot</b> 🤖<br><br>\nAsk me anything about <b>TallyPrime</b> like:<br><br>\n• Printing reports 🖨️<br>\n• Creating invoices 📄<br>\n• GST entries 🧾<br>\n• Ledger statements 📚<br>\n• Stock management 📦<br>\n• Accounting queries 💼\n```"
                    }
                });
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                const webhookRes = await fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: topic, log_id: logId }),
                });

                if (!webhookRes.ok) throw new Error(`Agent request failed with status ${webhookRes.status}`);
                textResponse = await webhookRes.text();
            }

            if (!textResponse) {
                throw new Error("Received empty response from agent");
            }

            let responseData;
            try {
                responseData = JSON.parse(textResponse);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                throw new Error("Received invalid JSON response from agent");
            }

            console.log("Parsed Data:", responseData);

            // Structure provided by user: { status: 200, body: { image: "...", log_id: "..." } }
            // OR updated structure: { status: 200, body: { output: "...", ... } }
            const resultBody = responseData.body || responseData;

            if (resultBody.output) {
                // Handle HTML output with code fences
                let cleanOutput = resultBody.output;
                if (cleanOutput.startsWith("```html")) {
                    cleanOutput = cleanOutput.replace(/^```html\s*/, "").replace(/\s*```$/, "");
                } else if (cleanOutput.startsWith("```")) {
                    cleanOutput = cleanOutput.replace(/^```\s*/, "").replace(/\s*```$/, "");
                }

                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: cleanOutput,
                    isHtml: true
                }]);
            } else if (resultBody.log_id === logId) {
                // Log ID Matched
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: resultBody.image,
                    title: `Research on ${topic}`,
                    isImage: true
                }]);
            } else {
                console.warn("Log ID mismatch or missing:", resultBody.log_id, "Expected:", logId);
                // Fallback / Error
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: "Error: Received response but Log ID did not match. Please try again.",
                    isImage: false
                }]);
            }

            setLoading(false);

        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { type: 'bot', content: `Error: ${error.message}` }]);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-none h-full flex flex-col">
            <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={loading}
            />
        </div>
    );
}
