'use strict';

class BluetoothDevice {
    #device = null;
    #deviceType = null;
    #handlers = [];
    #isSupported = false;

    constructor() {
        this.#isSupported = 'hid' in navigator;

        if (this.#isSupported === false) {
            return;
        }

        navigator.hid.addEventListener('connect', async (event) => {
            const connected = await this.connect();

            if (connected) {
                this.#dispatchEvent(event);
            }
        });

        navigator.hid.addEventListener('disconnect', async (event) => {
            if (event.device !== this.#device) {
                return;
            }

            const disconnected = await this.disconnect();

            if (disconnected) {
                this.#dispatchEvent(event);
            }
        });
    }

    get #DEVICES_MAP() {
        return [
            {vendorId: G60SPro.VENDOR_ID, productId: G60SPro.PRODUCT_ID, type: G60SPro},
            {vendorId: XiaomiButton.VENDOR_ID, productId: XiaomiButton.PRODUCT_ID, type: XiaomiButton},
        ];
    }

    get isConnected() {
        return this.#device !== null && this.#device.opened;
    }

    #dispatchCustomEvent(type, data) {
        const detail = data ? {detail: data} : null;

        this.#handlers.forEach((handler) => {
            if (type === handler.eventType && handler.callback) {
                handler.callback(new CustomEvent(type, detail));
            }
        });
    }

    #dispatchEvent(event) {
        this.#handlers.forEach((handler) => {
            if (event.type === handler.eventType && handler.callback) {
                handler.callback(event);
            }
        });
    }

    async #getDevice(showPicker = false) {
        const previousDevice = await this.#getPreviousDevice();

        if (previousDevice !== null) {
            return previousDevice;
        }

        if (showPicker) {
            const opts = {
                filters: this.#DEVICES_MAP,
            };
            const devices = await navigator.hid.requestDevice(opts);

            return devices.length > 0 ? devices[0] : null;
        }

        return null;
    }

    async #getPreviousDevice() {
        const devices = await navigator.hid.getDevices();

        for (const device of devices) {
            const matchedDevice = this.#DEVICES_MAP.find(
                d => d.vendorId === device.vendorId && d.productId === device.productId,
            );

            if (matchedDevice) {
                return device;
            }
        }

        return null;
    }

    #onButtonPressed(buffer) {
        const buttonId = this.#deviceType.getButtonIdFromBuffer(buffer);

        if (buttonId === 0) {
            return;
        }

        const details = {
            buttonId,
        };

        this.#dispatchCustomEvent('keypress', details);
    }

    addEventListener(eventType, callback) {
        this.#handlers.push({eventType, callback});
    }

    async connect(showPicker) {
        console.info('*Google-Meet-Remote-Control*', 'Connecting...');

        if (this.#isSupported === false) {
            throw new Error('Your browser is not supported.');
        }

        this.#device = await this.#getDevice(showPicker);

        if (this.#device === null) {
            console.info('*Google-Meet-Remote-Control*', 'No device found.');

            return false;
        }

        const deviceName = this.getDeviceName();
        const matchedDevice = this.#DEVICES_MAP.find(
            device => device.vendorId === this.#device.vendorId && device.productId === this.#device.productId,
        );

        console.info('*Google-Meet-Remote-Control*', `Found a device with the "${deviceName}" name.`);

        if (matchedDevice) {
            this.#deviceType = new matchedDevice.type();
        } else {
            console.warn('*Google-Meet-Remote-Control*', 'Unknown device type.');

            return false;
        }

        if (this.isConnected) {
            console.info('*Google-Meet-Remote-Control*', `"${deviceName}" is already connected.`);

            return true;
        }

        try {
            await this.#device.open();
        } catch (exception) {
            console.error('*Google-Meet-Remote-Control*', 'Unable to open the HID device.', exception);

            throw exception;
        }

        console.log('*Google-Meet-Remote-Control*', `"${deviceName}" connected.`);

        this.#device.addEventListener('inputreport', (event) => {
            if (event.reportId === this.#deviceType.INPUT_REPORT_ID) {
                this.#onButtonPressed(event.data.buffer);
            }
        });

        return true;
    }

    async disconnect() {
        if (this.#device === null) {
            return false;
        }

        const deviceName = this.getDeviceName();

        await this.#device.close();
        this.#device = null;
        this.#deviceType = null;

        console.log('*Google-Meet-Remote-Control*', `"${deviceName}" disconnected.`);

        return true;
    }

    getButtonIdByName(name) {
        return this.#deviceType.BUTTON_NAME_TO_ID_MAP[name];
    }

    getDeviceName() {
        if (this.#device === null) {
            throw new Error('Device is not connected.');
        }

        return this.#device.productName;
    }
}
