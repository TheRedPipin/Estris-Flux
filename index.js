window.onload = () => {
    const apiKeyInput = document.getElementById("APIKeyInput");
    const sendButton = document.getElementById("sendButton");
    const userInput = document.getElementById("userInput");
    const storedApiKey = sessionStorage.getItem("apiKey");
    if (storedApiKey) {
        apiKeyInput.value = storedApiKey;
        apiKeyInput.classList.remove("keyInputEmpty");
        apiKeyInput.classList.add("keyInputFilled");
    }
    sendButton.addEventListener("click", sendMessage);

    // Add Enter key support for mobile and desktop
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    apiKeyInput.addEventListener("input", () => {
        if (apiKeyInput.value.trim() === "") {
            apiKeyInput.classList.add("keyInputEmpty");
            apiKeyInput.classList.remove("keyInputFilled");
        } else {
            apiKeyInput.classList.remove("keyInputEmpty");
            apiKeyInput.classList.add("keyInputFilled");
            sessionStorage.setItem("apiKey", apiKeyInput.value.trim());
        }
    });
}

let systemPrompt = "";

fetch("./autismSystem.md")
    .then(response => response.text())
    .then(content => {
        systemPrompt = content;
    })
    .catch(error => console.error("Failed to load system prompt:", error));

async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    const apiKeyInput = document.getElementById("APIKeyInput").value;
    if (apiKeyInput.trim() === "") {
        document.getElementById("alertBox").innerText = "Please enter your API key.";
        document.getElementById("alertBox").classList.remove("hidden");
        setTimeout(() => {
            document.getElementById("alertBox").classList.add("hidden");
        }, 1000);
        return;
    }
    if (userInput.trim() === "") {
        document.getElementById("alertBox").innerText = "Please enter a message.";
        document.getElementById("alertBox").classList.remove("hidden");
        setTimeout(() => {
            document.getElementById("alertBox").classList.add("hidden");
        }, 1000);
        return;
    }
    document.getElementById("userInput").value = "";
    const userMessageDiv = document.createElement("div");
    userMessageDiv.id = "userMessage";
    userMessageDiv.innerText = userInput;
    document.getElementById("chatContainer").appendChild(userMessageDiv);
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKeyInput}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'amazon/nova-2-lite-v1:free',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userInput,
                },
            ],
        }),
    });
    const result = await response.json();
    const botMessageDiv = document.createElement("div");
    botMessageDiv.id = "botMessage";
    botMessageDiv.innerText = result.choices[0].message;
    document.getElementById("chatContainer").appendChild(botMessageDiv);
    document.getElementById("chatContainer").scrollTop = document.getElementById("chatContainer").scrollHeight;
}