let deferredPrompt;
let modalOpen = false;
let _focus = true;
const modal = document.getElementById('modal');
const modalandroid = document.getElementById('modal-android');
const modalios = document.getElementById('modal-ios');

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
  console.log("getmessage");
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
  const currenttime = getCurrentDateTime();
  formData.append('message', "This is a sample message, serialnumber is " + currenttime);

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

function getCurrentDateTime() {
  const now = new Date();

  // Get year, month, day, hour, minute, second
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  // Combine the components to form the datetime string
  const datetime = year + month + day + hour + minute + second;

  return datetime;
}

setInterval(sendMessage, 60000);

// Function App Badge
function clearBadge() {
  if (navigator.clearAppBadge) {
    navigator.clearAppBadge();
  } else if (navigator.clearExperimentalAppBadge) {
    navigator.clearExperimentalAppBadge();
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.clear();
  }
}

function showInstallWindow() {
  const os = getOS();
  if (modalOpen || (os != "iOS" && deferredPrompt == null)) return;  

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

async function showPrompt() {
  hideInstallWindow();

  if (deferredPrompt != null) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
}

function getOS() {
  const userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os = "";

  if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else {
    os = 'Desktop';
  }

  return os;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

window.addEventListener('click', function(event) {
  if (event.target == modal || event.target == modalandroid || event.target == modalios) {
    hideInstallWindow();
  }
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
});

window.addEventListener('focus', function() {
  console.log("focus");
  if (_focus) return;

  if (window.matchMedia('(display-mode: standalone)').matches) {
    getMessgaes();
  } else {
    console.log("app is not installed");
  }
  _focus = true;
});

window.addEventListener('blur', () => {
  console.log("blur");
  _focus = false;
});

window.addEventListener('load', async function() {
  getMessgaes();
  await Notification.requestPermission();

  document.getElementById('ok').addEventListener('click', showPrompt);
  document.getElementById('cancel').addEventListener('click', hideInstallWindow);
  document.getElementById('androidok').addEventListener('click', showPrompt);
  document.getElementById('androidcancel').addEventListener('click', hideInstallWindow);
  document.getElementById('iosok').addEventListener('click', showPrompt);
  document.getElementById('ioscancel').addEventListener('click', hideInstallWindow);
});

setTimeout(showInstallWindow, 3000);

document.getElementById('loadmessage').addEventListener('click', () => {
  getMessgaes();
});