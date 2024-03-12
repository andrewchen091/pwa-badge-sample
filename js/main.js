let deferredPrompt;
let modalOpen = false;
const modal = document.getElementById('modal');
const buttonOk = document.getElementById('ok');
const buttonCancel = document.getElementById('cancel');

window.addEventListener('focus', function() {
  document.getElementById('pwa').innerHTML = "<b>PWA badge sample - focus</b>";

  if ('getInstalledRelatedApps' in window.navigator) {
    window.navigator.getInstalledRelatedApps()
      .then((relatedApps) => {
        console.log("relatedApps:", relatedApps)
        const isInstalled = relatedApps.some(app => app.id === 'PWA badge sample');
        if (isInstalled) {
          console.log('PWA app is installed.');
        } else {
          console.log('PWA app is not installed.');
        }
      })
      .catch((error) => {
        console.error('Error checking installed apps:', error);
      });
  } else {
    console.log('getInstalledRelatedApps not supported.');
  }
});

window.addEventListener('blur', function() {
  document.getElementById('pwa').innerHTML = "<b>PWA badge sample</b>";
});

window.addEventListener('load', function() {
  console.log("load");
});

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
  $.ajax({
    url: 'https://www.48v.me/~badgetest/cgi-bin/get_pwa_messages.py',
    method: 'get',
    success: (response) => {
      setBadge(0);

      viewMessage(response.data);
    },
    error: (e) => {
      console.log("Get messages error", e);
    }
  })
}

getMessgaes();

function viewMessage(data) {
  if (data.length != 0) {
    localStorage.setItem('pwa-message', data);
  } else {
    data = localStorage.getItem('pwa-message')
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

function getMessageCount() {
  $.ajax({
    url: 'https://www.48v.me/~badgetest/cgi-bin/get_pwa_message_count.py',
    method: 'get',
    success: (response) => {
      setBadge(response.count);
    },
    error: (e) => {
      console.log("Get message error", e);
    }
  })
}

function sendMessage() {
  $.ajax({
    url: 'https://www.48v.me/~badgetest/cgi-bin/add_pwa_message.py',
    method: 'post',
    data: { message: "This is a sample message" },
    success: (response) => {},
    error: (e) => {
      console.log("Add message error", e)
    }
  })
}

setInterval(getMessageCount, 4000);
setInterval(sendMessage, 60000);

// Function App Badge
async function setBadge(badgeCount) {
  await Notification.requestPermission();

  if (navigator.setAppBadge) {
    navigator.setAppBadge(badgeCount);
  } else if (navigator.setExperimentalAppBadge) {
    navigator.setExperimentalAppBadge(badgeCount);
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.set(badgeCount);
  } else {
    console.log("App badge is unsupported.");
  }
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
  if (event.target == modal) {
    hideInstallWindow();
  }
});

window.addEventListener('appinstalled', () => {
  console.log("app already install");
  deferredPrompt = null;
});