'use strict';

class G60SPro {
    static PRODUCT_ID = 12992;
    static VENDOR_ID = 10007;

    BUTTON_NAME_TO_ID_MAP = {
        'microphone': 65,
        'camera': 36,
    };

    INPUT_REPORT_ID = 1;

    constructor() {
    }

    getButtonIdFromBuffer(buffer) {
        const keys = new Int8Array(buffer);
        const data = Array.from(keys);

        return data[0];
    }
}
