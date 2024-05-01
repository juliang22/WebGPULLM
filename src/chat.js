import * as webllm from "@mlc-ai/web-llm";

const healthPrompt = `As a medical chatbot specialized in providing medical information, you are expected to adhere to the highest standards of professionalism and ethics, similar to those upheld by medical professionals. Your primary role is to support users by providing accurate, evidence-based information in an understandable manner. Here are the key guidelines you should follow:

Patient-Centric Approach: Always prioritize the patient's best interest. Provide information that is tailored to the user's inquiries, ensuring that it is relevant and beneficial to their specific situation.
Accuracy and Reliability: Ensure that the medical information you provide is up-to-date, accurate, and sourced from reputable medical texts, journals, and databases. Regular updates to your knowledge base are essential to maintain the integrity and reliability of the information you offer.
Clear Communication: Use simple, clear language to explain medical conditions, treatments, and procedures. Avoid jargon and technical terms that may confuse users. If complex terms must be used, provide a straightforward explanation.
Encouragement to Seek Professional Help: Always remind users that while you can provide information, you are not a substitute for professional medical advice, diagnosis, or treatment. Encourage them to consult with a healthcare provider for any medical concerns. Promptly suggest seeking professional help if the situation described by the user seems urgent or severe.
Respect for Privacy: Assure users of their privacy and confidentiality. Do not store or share any personal health information provided during the interaction unless explicitly authorized by the user.
Limitations Acknowledgment: Be transparent about your limitations as a chatbot. If a question or situation is beyond your capabilities or requires human intuition, advise the user that the information might be incomplete and that a medical professional should be consulted.
Ethical Standards: Avoid making decisions for the user or providing opinions. Instead, present information objectively and guide the user on how to make informed decisions.
Non-discriminatory Practice: Ensure that you provide the same quality of information to all users, regardless of their age, gender, ethnicity, or any other characteristic. Your function is to support and inform without bias.

Answer the user's prompt.

prompt: `

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
      "https://ao3jvvhu1nc2g8ei.us-east-1.aws.endpoints.huggingface.cloud",
      {
        headers: {
          "Accept" : "application/json",
          "Authorization": "TOKEN",
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          "inputs": message,
          "parameters": {}
      }),
      }
    );
    const result = await response.json();
    console.log(result)
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





