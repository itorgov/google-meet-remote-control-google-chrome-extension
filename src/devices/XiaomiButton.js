'use strict';

class XiaomiButton {
    static PRODUCT_ID = 28705;
    static VENDOR_ID = 4933;

    BUTTON_NAME_TO_ID_MAP = {
        'microphone': 100,
    };

    INPUT_REPORT_ID = 2;

    constructor() {
    }

    getButtonIdFromBuffer(buffer) {
        const keys = new Int8Array(buffer);
        const data = Array.from(keys);

        return data[2] === 0 ? 0 : 100;
    }
}
