let deferredPrompt;
let modalOpen = false;
const modal = document.getElementById('modal');
const buttonOk = document.getElementById('ok');
const buttonCancel = document.getElementById('cancel');

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }
  
  function getMessgaes() {
    $.ajax({
      url: 'https://www.48v.me/~badgetest/cgi-bin/admin/get_pwa_messages.py',
      method: 'get',
      success: (response) => {
        navigator.clearAppBadge();

        viewMessage(response.data);
      },
      error: (e) => {
        console.log("Get messages error", e);
      }
    })
  }

  function viewMessage(data) {
    const len = data.length;
    let str = "";

    for (let i = 0; i < len; i++) {
      if (data[i].flag == "1") {
        str += "<p><b>" + data[i].message + "</b></p>";
      } else {
        str += "<p>" + data[i].message + "</p>";
      }
    }
    
    const messageArea = document.getElementById("message");
    messageArea.innerHTML=str;
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  function getMessageCount() {
    $.ajax({
      url: 'https://www.48v.me/~badgetest/cgi-bin/admin/get_pwa_message_count.py',
      method: 'get',
      success: (response) => {
        if ('setAppBadge' in navigator) {
          navigator.setAppBadge(response.count);
        }
      },
      error: (e) => {
        console.log("Get message error", e);
      }
    })
  }

  function sendMessage() {
    $.ajax({
      url: 'https://www.48v.me/~badgetest/cgi-bin/admin/add_pwa_message.py',
      method: 'post',
      data: { message: "This is a sample message" },
      success: (response) => {},
      error: (e) => {
        console.log("Add message error", e)
      }
    })
  }

  getMessgaes();
  setInterval(getMessageCount, 4000);
  setInterval(sendMessage, 60000);
}

function showInstallWindow() {
  if (modalOpen) return;
  modal.style.display = 'block';
  modalOpen = true;  
}

function hideInstallWindow() {
  modal.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(showInstallWindow, 3000);
});

buttonOk.addEventListener('click', async () => {  
  hideInstallWindow();
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

buttonCancel.addEventListener('click', async () => {
  hideInstallWindow();
});

window.addEventListener('click', function(event) {
  if (event.target === modal) {
    hideInstallWindow();
  }
});

window.addEventListener('appinstalled', () => {
  console.log("app already install");
  deferredPrompt = null;
});