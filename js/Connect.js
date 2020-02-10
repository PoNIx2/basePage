/*!
 * Connect.js
 *
 * Copyright (c) 2020 Takuya Oishi
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

function Connect(pageData) {
    this.xhr = new XMLHttpRequest;
    this.xhr.pd = pageData || new DataContainer;
    if(this.xhr.pd.get("run")) {
        this.xhr.pd.get("run").connector = {};
    } else {
        this.xhr.pd.set("run", {
            "connector": {}
        });
    }
    if(this.xhr.pd.get("running")) {
        this.xhr.pd.get("running").connector = false;
    } else {
        this.xhr.pd.set("running", {
            "connector": false
        });
    }
    if(this.xhr.pd.get("next")) {
        this.xhr.pd.get("next").connector = [];
    } else {
        this.xhr.pd.set("next", {
            "connector": []
        });
    }
};
Connect.prototype = {
    reservation: function(arg) {
        this.xhr.pd.get("next").connector.push(arg);
    },
    run: function(skip) {
        if(!this.xhr.pd.get("running").connector || skip) {
            this.xhr.pd.get("running").connector = true;
            if(this.xhr.pd.get("next").connector.length) {
                if(this.xhr.pd.get("next").connector.length < 50) {
                    const nextParam = this.xhr.pd.get("next").connector[0];
                    this.xhr.pd.get("run").connector.method = nextParam.method || "POST";
                    this.xhr.pd.get("run").connector.url = nextParam.url || "";
                    this.xhr.pd.get("run").connector.sync = nextParam.sync || true;
                    this.xhr.pd.get("run").connector.type = nextParam.type || "";
                    this.xhr.pd.get("run").connector.parameter = nextParam.parameter;
                    this.xhr.pd.get("run").connector.callback = nextParam.callback || function(e){return};
                    this.xhr.pd.get("run").connector.ContentType = nextParam.ContentType;
                    this.xhr.pd.get("next").connector.shift();
                    this.send();
                } else {
                    alert("サーバーとの接続が不安定です");
                    this.xhr.pd.get("run").connector = {};
                    this.xhr.pd.get("next").connector = [];
                    this.xhr.pd.get("running").connector = false;
                }
            } else {
                this.xhr.pd.get("run").connector = {};
                this.xhr.pd.get("running").connector = false;
            }
        }
    },
    send: function() {
        if(this.xhr.pd.get("run").connector.method === "GET") {
            if(this.xhr.pd.get("run").connector.parameter) {
                let step = 0;
                for(let key in this.xhr.pd.get("run").connector.parameter) {
                    if(step) {
                        this.xhr.pd.get("run").connector.url = this.xhr.pd.get("run").connector.url + "?";
                        step++;
                    } else {
                        this.xhr.pd.get("run").connector.url = this.xhr.pd.get("run").connector.url + "&";
                    }
                    this.xhr.pd.get("run").connector.url = this.xhr.pd.get("run").connector.url + key + "=" + this.xhr.pd.get("run").connector.parameter[key];
                }
            }
        }
        this.xhr.open(this.xhr.pd.get("run").connector.method, this.xhr.pd.get("run").connector.url, this.xhr.pd.get("run").connector.url);
        this.xhr.responseType = this.xhr.pd.get("run").connector.type;
        this.xhr.setRequestHeader("Content-Type", this.xhr.pd.get("run").connector.ContentType || "application/x-www-form-urlencoded");
        this.xhr.onreadystatechange = function() {
            switch(this.readyState) {
                case 0: break;
                case 1: break;
                case 2: break;
                case 3: break;
                case 4:
                    this.pd.get("run").connector.callback(this);
                    this.abort();
                    this.pd.get("connector").run(true);
                    break;
            }
        }
        if(this.xhr.pd.get("run").connector.method === "GET") {
            this.xhr.send();
        } else {
            this.xhr.send(this.xhr.pd.get("run").connector.parameter);
        }
    },
    close: function() {
        this.xhr.abort();
    }
};