import * as webllm from "@mlc-ai/web-llm";

let chatMessages, select, messageForm, messageInput, progressAlert, engine;
document.addEventListener('DOMContentLoaded', function() {
  let chatMessages = document.getElementById('chat-messages');
  let select = document.getElementById('bot-dropdown');
  let messageForm = document.getElementById('message-form');
  let messageInput = document.getElementById('message-input');
  let progressAlert = document.getElementById('progress-alert');
  console.log(select)

  async function handleOpenBioInference(message) {
    console.log("Handling message for Bot 1:", message);
    const response = await fetch(
        "https://ftsi64740sycs752.us-east-1.aws.endpoints.huggingface.cloud", {
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"inputs": message, "parameters": {}})
        }
    );
    const result = await response.json();
    const responseStr = JSON.stringify(result[0]["generated_text"]).replace(/"/g, '');
    updateLastMessage(responseStr); // Update bot message with actual content
}

async function handleLocalInference(message) {
    console.log("Handling message for Bot 2:", message);
    const reply = await engine.chat.completions.create({
        messages: [{ "role": "user", "content": message }],
        n: 1
    });
    const replyStr = reply["choices"][0]["message"]["content"];
    updateLastMessage(replyStr); // Update bot message with actual content
}

function handleMessage(message) {
  let selectedBot = select.value;
  document.getElementById("welcome-splash").style.display = "none";
  appendMessage(message, 'user'); // Show user message immediately
  appendMessage("...", 'from-bot'); // Placeholder for bot response

  switch (selectedBot) {
      case 'bot1':
          handleOpenBioInference(message);
          break;
      case 'bot2':
          handleLocalInference(message);
          break;
      default:
          console.log('No specific bot selected');
  }
}


function appendMessage(message, sender) {
  let messageElement = document.createElement('li');
  messageElement.textContent = message;
  messageElement.classList.add(sender === 'user' ? 'from-user' : 'from-bot');
  chatMessages.appendChild(messageElement);
}

function updateLastMessage(newMessage) {
  let botMessages = document.querySelectorAll('.from-bot');
  let lastBotMessage = botMessages[botMessages.length - 1];
  lastBotMessage.textContent = newMessage; // Update the last bot message
}

document.getElementById('message-form').addEventListener('submit', function(event) {
  event.preventDefault();
  let message = messageInput.value.trim();
  if (message) {
      handleMessage(message);
      messageInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

  messageForm.addEventListener('submit', function(event) {
      event.preventDefault();
      let message = messageInput.value.trim();
      if (message) {
          handleMessage(message);
          messageInput.value = '';
          chatMessages.scrollTop = chatMessages.scrollHeight;
      }
  });

  select.addEventListener('change', function() {
      // Toggle the visibility of the progress alert based on selection
      progressAlert.style.display = (select.value === 'bot2') ? 'block' : 'none';
      document.getElementById('message-input').disabled = false
  });

  async function main() {
      const initProgressCallback = (report) => {
          if (select.value === 'bot2') {
              progressAlert.textContent = report.text; // Update the text of the alert
              document.getElementById('message-input').disabled = true
          }
      };
      const selectedModel = "Llama-3-8B-Instruct-q4f32_1";
      engine = await webllm.CreateEngine(
          selectedModel,
          { initProgressCallback: initProgressCallback }
      );
      document.getElementById('message-input').disabled = false
  }

  main();

  // Check the initial bot selection on load
  progressAlert.style.display = (select.value === 'bot2') ? 'block' : 'none';
});





