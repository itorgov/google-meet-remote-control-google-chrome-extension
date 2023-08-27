'use strict';

class GoogleMeetWrapper {
    #bluetoothDevice;
    #currentRoom;
    #hasBeenActivated = false;

    constructor(bluetoothDevice) {
        this.#bluetoothDevice = bluetoothDevice;
        this.#bluetoothDevice.addEventListener('keypress', (event) => {
            this.#handleBluetoothDeviceButtonPress(event.detail.buttonId);
        });

        window.addEventListener('click', () => {
            if (this.#hasBeenActivated || !navigator.userActivation.isActive) {
                return;
            }

            this.#hasBeenActivated = true;
        });

        const pathname = window.location.pathname;
        const bodyObserver = new MutationObserver(() => {
            if (pathname === '/' || pathname === '/landing') {
                this.#enterLobby();
            } else if (document.querySelector('[jscontroller=dyDNGc]')) {
                this.#enterGreenRoom();
            } else if (document.querySelector('div[data-second-screen]')) {
                this.#enterMeeting();
            } else if (document.querySelector('[jsname=r4nke]')) {
                this.#enterExitHall();
            }
        });

        bodyObserver.observe(document.body, {attributes: true, childList: true, subtree: true});
    }

    get #ROOM_NAMES() {
        return {
            lobby: 'lobby',
            greenRoom: 'greenRoom',
            meeting: 'meeting',
            exitHall: 'exitHall',
        };
    };

    #clickButton(button, buttonName) {
        if (!button) {
            console.warn('*Google-Meet-Remote-Control*', `Unable to find/click the "${buttonName}" button.`);

            return;
        }

        button.click();
    }

    #clickGreenRoomCameraButton() {
        const button = this.#getGreenRoomCameraButton();
        this.#clickButton(button, 'greenCam');
    }

    #clickGreenRoomMicrophoneButton() {
        const button = this.#getGreenRoomMicrophoneButton();
        this.#clickButton(button, 'greenMic');
    }

    #clickMeetingCameraButton() {
        const button = this.#getMeetingCameraButton();
        this.#clickButton(button, 'camOnOff');
    }

    #clickMeetingMicrophoneButton() {
        const button = this.#getMeetingMicrophoneButton();
        this.#clickButton(button, 'micOnOff');
    }

    #enterExitHall() {
        if (this.#currentRoom === this.#ROOM_NAMES.exitHall) {
            return;
        }

        this.#currentRoom = this.#ROOM_NAMES.exitHall;

        console.info('*Google-Meet-Remote-Control*', 'Room:', this.#currentRoom);
    }

    #enterGreenRoom() {
        if (this.#currentRoom === this.#ROOM_NAMES.greenRoom) {
            return;
        }

        this.#currentRoom = this.#ROOM_NAMES.greenRoom;

        console.info('*Google-Meet-Remote-Control*', 'Room:', this.#currentRoom);
    }

    #enterLobby() {
        if (this.#currentRoom === this.#ROOM_NAMES.lobby) {
            return;
        }

        this.#currentRoom = this.#ROOM_NAMES.lobby;

        console.info('*Google-Meet-Remote-Control*', 'Room:', this.#currentRoom);
    }

    #enterMeeting() {
        if (this.#currentRoom === this.#ROOM_NAMES.meeting) {
            return;
        }

        this.#currentRoom = this.#ROOM_NAMES.meeting;

        console.info('*Google-Meet-Remote-Control*', 'Room:', this.#currentRoom);
    }

    #getGreenRoomCameraButton() {
        const sel = '[jscontroller=vuC9df]';
        return document.querySelector(sel)?.querySelector('[role=button]');
    }

    #getGreenRoomMicrophoneButton() {
        const sel = '[jscontroller=t2mBxb]';
        return document.querySelector(sel)?.querySelector('[role=button]');
    }

    #getMeetingCameraButton() {
        const sel = '[jscontroller=vuC9df]';
        return document.querySelector(sel)?.querySelector('button');
    }

    #getMeetingMicrophoneButton() {
        const sel = '[jscontroller=t2mBxb]';
        return document.querySelector(sel)?.querySelector('button');
    }

    #handleBluetoothDeviceButtonPress(buttonId) {
        console.debug('*Google-Meet-Remote-Control*', `Pressed a button with the ${buttonId} ID.`);

        switch (this.#currentRoom) {
            case this.#ROOM_NAMES.greenRoom:
                switch (buttonId) {
                    case this.#bluetoothDevice.getButtonIdByName('microphone'):
                        this.#clickGreenRoomMicrophoneButton();

                        break;
                    case this.#bluetoothDevice.getButtonIdByName('camera'):
                        this.#clickGreenRoomCameraButton();

                        break;
                }

                break;
            case this.#ROOM_NAMES.meeting:
                switch (buttonId) {
                    case this.#bluetoothDevice.getButtonIdByName('microphone'):
                        this.#clickMeetingMicrophoneButton();

                        break;
                    case this.#bluetoothDevice.getButtonIdByName('camera'):
                        this.#clickMeetingCameraButton();

                        break;
                }

                break;
        }
    }
}
