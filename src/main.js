'use strict';

const bluetoothDevice = new BluetoothDevice();
const bluetoothDeviceButtonID = 'bluetoothDeviceHelperConnect';
const googleMeetWrapper = new GoogleMeetWrapper(bluetoothDevice);

function addConnectButton() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/landing') {
        return;
    }

    const buttonElement = document.createElement('button');
    buttonElement.id = bluetoothDeviceButtonID;
    buttonElement.type = 'button';
    buttonElement.innerText = 'Connect Bluetooth device';
    Object.assign(buttonElement.style, {
        backgroundColor: 'rgb(26,115,232)',
        border: 'none',
        borderRadius: '4px',
        color: '#fff',
        fontFamily: '"Google Sans",Roboto,Arial,sans-serif',
        fontSize: '1rem',
        fontWeight: '500',
        height: '3em',
        marginLeft: '1.5em',
        padding: '0 12px',
    });
    buttonElement.addEventListener('click', async () => {
        await bluetoothDevice.connect(true);
    });

    document.querySelector('div.gb_hd.gb_7c').appendChild(buttonElement);
}

function manageConnectButton() {
    if (bluetoothDevice.isConnected) {
        const elem = document.getElementById(bluetoothDeviceButtonID);

        if (elem) {
            elem.remove();
        }
    } else {
        addConnectButton();
    }
}

async function init() {
    if (window.location.pathname.startsWith('/linkredirect')) {
        return;
    }

    bluetoothDevice.addEventListener('connect', () => {
        manageConnectButton();
    });

    bluetoothDevice.addEventListener('disconnect', () => {
        manageConnectButton();
    });

    const isConnected = await bluetoothDevice.connect();

    if (isConnected === false) {
        manageConnectButton();
    }
}

init();
