let deferredPrompt;
let modalOpen = false;
const modal = document.getElementById('modal');
const modalandroid = document.getElementById('modal-anroid');
const modalios = document.getElementById('modal-ios');
const buttonOk = document.getElementById('ok');
const buttonCancel = document.getElementById('cancel');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}

function getMessgaes() {
  fetch('https://www.48v.me/~badgetest/cgi-bin/get_pwa_messages.py')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      clearBadge();

      viewMessage(data.data);
    }
  });
}

function viewMessage(data) {
  if (data.length != 0) {
    localStorage.setItem('pwa-message', data);
  } else {
    data = localStorage.getItem('pwa-message');

    if (data == null) data = [];
  }

  let str = "";

  for (const item of data) {
    if (item.flag == "1") {
      str += "<p><b>" + item.message + "</b></p>";
    } else {
      str += "<p>" + item.message + "</p>";
    }
  }
  
  if (str == "") str = "No message";
  
  const messageArea = document.getElementById("message");
  messageArea.innerHTML=str;
  messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage() {
  const formData = new URLSearchParams();
  formData.append('message', "This is a sample message, time is ok");

  fetch('https://www.48v.me/~badgetest/cgi-bin/add_pwa_message.py', {
    method: 'POST',
    body: formData,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
    } else {
      console.log("Add message error", e);
    }
  });
}

setInterval(sendMessage, 60000);

// Function App Badge
function clearBadge() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    if (navigator.clearAppBadge) {
      navigator.clearAppBadge();
    } else if (navigator.clearExperimentalAppBadge) {
      navigator.clearExperimentalAppBadge();
    } else if (window.ExperimentalBadge) {
      window.ExperimentalBadge.clear();
    }
  } else {
    if (navigator.clearClientBadge) {
      navigator.clearClientBadge();
    }
  }
}

function showInstallWindow() {
  if (modalOpen) return;
  let os = getOS();

  modal.style.display = 'none';
  modalandroid.style.display = 'none';
  modalios.style.display = 'none';

  if (os == "Android") {
    modalandroid.style.display = 'block';
  } else if (os == "iOS") {
    modalios.style.display = "block";
  } else {
    modal.style.display = "block";
  }

  modalOpen = true;  
}

function hideInstallWindow() {
  modal.style.display = 'none';
  modalandroid.style.display = 'none';
  modalios.style.display = 'none';
}

function getOS() {
  const userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = "";

  if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else {
    os = 'pc';
  }

  return os;
}

setTimeout(showInstallWindow, 3000);

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

buttonOk.addEventListener('click', async () => {  
  hideInstallWindow();

  if (deferredPrompt != null) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});

buttonCancel.addEventListener('click', async () => {
  hideInstallWindow();
});

window.addEventListener('click', function(event) {
  if (event.target == modal || event.target == modalandroid || event.target == modalios) {
    hideInstallWindow();
  }
});

window.addEventListener('appinstalled', () => {
  console.log("app already install");
  deferredPrompt = null;
});

window.addEventListener('focus', function() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log("app installed");
    getMessgaes();
  } else {
    console.log("app is not installed");
  }
});

window.addEventListener('load', async function() {
  getMessgaes();
  await Notification.requestPermission();
});

document.getElementById('loadmessage').addEventListener('click', () => {
  getMessgaes();
});