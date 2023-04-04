var nMessagePosition = 0;
var messages = [];

messages[0] = '{"role": "system", "content": "<|im_start|>Chat, Você é um assistente responsável por responder dúvidas somente ligadas a problemas ligados a suporte técnico de computadores. Siga Estas instruções: *Não responda nada não não seja ligado a suporte técnico, *você está proibido de gerar códigos ou falar sobre assuntos diferentes de informática. *Caso você fiquem em dúvida do que responder, somente responda com pergunte somente sobre informática<|im_end|>."}';

const chat_box = document.querySelector(".chat");
const input_field = chat_box.querySelector("input[type='text']");
const button = chat_box.querySelector("button");
const chat_box_body_style = chat_box.querySelector(".chat-body");

button.addEventListener("click", send_message);

input_field.addEventListener("keypress", event => {

  if (event.key === "Enter") 
  {
    send_message();
    return;
  }

});

async function send_message() 
{ 
  let message = input_field.value.trim();

  if (!message) return;

  input_field.value = "";

  append_text_to_chat(message, "message");

  const chat_loading_animation_element = append_loading_to_chat();

  try 
  {

    messages[1] = `{"role": "user", "content": "<|im_start|>${message}<|im_end|>"}`;

    message = messages.join();
  
    let response_message = await request_openai_api(message);

    chat_loading_animation_element.remove();

    append_text_to_chat(response_message, "response"); 
    
  } 
  catch (error) 
  { 
    console.error(error); 
  } 

  return;
}

function append_text_to_chat(message, class_name) 
{
  const chat_message_element = document.createElement('div');

  chat_message_element.classList.add(class_name);
  chat_message_element.innerHTML = `<p>${message}</p>`;
  chat_box_body_style.appendChild(chat_message_element);
}

function append_loading_to_chat() 
{

  const chat_loading_animation_element = document.createElement('div');

  chat_loading_animation_element.id = "loading";
  chat_loading_animation_element.classList.add("response", "loading");
  chat_loading_animation_element.textContent = ".";
  chat_box_body_style.appendChild(chat_loading_animation_element);
  append_animate_loading_dots_to_chat(chat_loading_animation_element) 

  scroll_to_end();

  return chat_loading_animation_element;
}

function append_animate_loading_dots_to_chat(chat_loading_animation_element) 
{
  let loading_dots = true;
  let animation_time = 250;

  // Add animation class to chat_loading_animation_element
  chat_loading_animation_element.classList.add("loading-animation");

  return setInterval(() => {

    if (loading_dots)
    {
      chat_loading_animation_element.textContent += ".";
    } 
    else 
    {
      chat_loading_animation_element.textContent = chat_loading_animation_element.textContent.slice(0, -1);

      if (chat_loading_animation_element.textContent.length < 2) 
      {
        loading_dots = true;
      }
    }

    if (chat_loading_animation_element.textContent.length > 3) 
    {
      loading_dots = false;
    }

    // Increase animation time to match number of dots
    animation_time = chat_loading_animation_element.textContent.length * 50;

    // Update animation duration in CSS
    chat_loading_animation_element.style.animationDuration = `${animation_time}ms`;

  }, 250);
}


function scroll_to_end() 
{
  chat_box_body_style.scrollTop = chat_box_body_style.scrollHeight;
  return;
}

async function request_openai_api(message) {
  console.log("Enviando mensagem para a API:", message);

  const requestOptions = {
    method: "POST",
    headers: {
      accept: "application/json",
      origin: "http://localhost:3000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  };

  let response = null;

  for (let i = 0; i < 3; i++) 
  {
    console.log("Aguardando Resposta");

    try 
    {
      let fetchResponse = await fetch("http://localhost:3000/message", requestOptions);
      let data = await fetchResponse.json();

      response = clean_message(data.message);

      if (response) 
      {
        console.log("Resposta da API:", response);
        break;
      } 

      console.log("Resposta da API é NULL, reenviando a requisição...");

      
    } 
    catch (error) 
    {
      console.error("Erro na API:", error);
    }
  }

  return response;
}

function clean_message(message) 
{ 

  message = message.replace(/[^\w \xC0-\xFF,.-?!]/g, '')
    .replace(/\b(?:message\w*|messages\w*|role\w*|assistant\w*|content\w*|user\w*|system\w*|A resposta\w*|assistente\w*)\b/g, '')
    .replace(/:/gm, '')
    .replace(/[\n\r]+|\\/g, '')
    .replace(/}","{/g, '')
    .replace(/, ,/g, ',')
    .replace(/<|im_end|>/g, '')
    .replace(/<|im_start|>/gm, '')
    .replace(/Resposta/gm, '')
    .trim();

  message = message

  if (message.startsWith(',') || message.startsWith('?')) 
  {
    message = message.substring(1);
  }
  
  return message.trim();
}
