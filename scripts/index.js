EVT.setup({ apiUrl: 'https://api.evrythng.com' });

EVT.use(EVT.Scan);

const UI = {
  buttonStartCamera: document.getElementById('button-start-camera'),
  checkboxRedirect: document.getElementById('checkbox-redirect'),
  anchorResult: document.getElementById('result'),
  selectMethod: document.getElementById('select-type'),
  inputApiKey: document.getElementById('input-api-key'),
};

let app;

const getQueryParam = (key) => {
  const params = window.location.search.substring(1)
    .split('&')
    .reduce((res, item) => {
      const [key, value] = item.split('=');
      res[key] = value;
      return res;
    }, {});

  return params[key];
};

const createFilter = () => {
  const map = {
    qr: { method: '2d', type: 'qr_code' },
    ir: { method: 'ir', type: 'image' },
    other: { method: 'auto', type: 'auto' },
  };
  return map[UI.selectMethod.value];
};

const startCamera = () => {
  if(!UI.inputApiKey.value || UI.inputApiKey.value.length !== 80) {
    alert('Please specify an Application API Key!');
    return;
  }

  const app = new EVT.App(UI.inputApiKey.value);
  app.scanStream({
    filter: createFilter(),
    containerId: 'stream_container',
  })
  .then((res) => {
    if (!res.length) {
      UI.anchorResult.innerHTML = 'No results';
      return;
    }

    // Raw URL
    const url = (res.length && res[0].results.length) 
      ? res[0].results[0].redirections[0]
      : res[0].meta.value;

    UI.anchorResult.innerHTML = url;
    UI.anchorResult.href = url;
    
    if (UI.checkboxRedirect.checked) {
      app.redirect(url);
      return;
    }
  })
  .catch(console.log);
};

const main = () => {
  UI.inputApiKey.value = window.config
    // If fixed config exists, use it
    ? window.config.APPLICATION_API_KEY
    // Prefil from URL query param if available
    : getQueryParam('app') || '';

  UI.buttonStartCamera.addEventListener('click', startCamera);
};

main();
