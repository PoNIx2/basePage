/*!
 * DataContainer.js
 *
 * Copyright (c) 2020 Takuya Oishi
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

function DataContainer() {
    this.data = {};
};
DataContainer.prototype = {
    set: function(key, val) {
        this.data[key] = val;
    },
    get: function(key) {
        return this.data[key];
    },
    clear: function(key) {
        this.data[key] = null;
    },
    delete : function(key) {
        delete this.data[key];
    }
};