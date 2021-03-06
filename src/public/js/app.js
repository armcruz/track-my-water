const water = document.getElementById('water');

const socket = io();
socket.on('waterTank:change', (record) => {
	changeWaterLevel(record.waterLevel);
});

function changeWaterLevel(level) {
	if (level > 0 && level <= 100) {
		water.style.height = `${250 * (level / 100)}px`;
		water.classList.remove('water--empty');
	} else if (level === 0) {
		water.style.height = '0px';
		water.classList.add('water--empty');
	}
}

async function loadLastWaterRecord() {
	try {
		const response = await fetch(`${location.href}api/waterTank/last`);
		const { record } = await response.json();
		if (!record) throw 'No hay registros aún';
		changeWaterLevel(record.waterLevel);
	} catch (err) {
		console.log(err);
	}
}

// Push Notifications
const beamsClient = new PusherPushNotifications.Client({
	instanceId: 'a7dc2222-eb7a-4db9-872c-505ed897b2f3',
});

beamsClient
	.start()
	.then(() => beamsClient.addDeviceInterest('waterTank'))
	.then(() => console.log('Successfully registered and subscribed!'))
	.catch(console.error);

document.addEventListener('DOMContentLoaded', () => {
	// Si es la página de monitoreo, consulta el último registro al cargarse
	if (location.pathname === '/') {
		loadLastWaterRecord();
	}
	if (navigator.serviceWorker) {
		navigator.serviceWorker.register('service-worker.js');
	}
});

let deferredPrompt;

const $downloadBtn = document.getElementById('btn-install');
if ($downloadBtn) {
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		// Almacena el objeto del evento para posteriormente disparar el prompt de instalación
		deferredPrompt = e;
		// Muestra el botón para instalar
		$downloadBtn.classList.remove('d-none');
	});

	$downloadBtn.addEventListener('click', (e) => {
		// Muestra el dialogo para instalar
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') {
				$downloadBtn.remove();
			} else {
				console.log('User dismissed the A2HS prompt');
			}
			deferredPrompt = null;
		});
	});
}
